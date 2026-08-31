#!/usr/bin/env node
/**
 * Bootstraps the first admin account: creates the Firebase Auth user (if it
 * doesn't already exist) and its users/{uid} Firestore doc with role "admin"
 * and status "active".
 *
 * Runs with the Firebase Admin SDK, which bypasses Firestore security rules —
 * this is what breaks the chicken-and-egg problem where creating a user doc
 * normally requires an existing admin to already be signed in.
 *
 * Usage:
 *   npm run create-admin -- --email you@example.com --password yourpassword --name "Your Name"
 *
 * Requires a Firebase service account key (Firebase Console > Project
 * Settings > Service Accounts > Generate new private key). By default this
 * script looks for ./serviceAccountKey.json; override with --service-account.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import admin from "firebase-admin";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      args[key] = value;
      i++;
    }
  }
  return args;
}

function printUsageAndExit(message) {
  if (message) console.error(`${message}\n`);
  console.error(
    'Usage: npm run create-admin -- --email you@example.com --password yourpassword --name "Your Name" [--service-account ./serviceAccountKey.json]',
  );
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const email = args.email;
const password = args.password;
const name = args.name ?? "Admin";
const serviceAccountPath = args["service-account"] ?? "./serviceAccountKey.json";

if (!email || !password) {
  printUsageAndExit("Missing --email or --password.");
}
if (password.length < 6) {
  printUsageAndExit("Password must be at least 6 characters.");
}

const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(resolvedPath, "utf8"));
} catch {
  console.error(`Could not read service account key at ${resolvedPath}`);
  console.error(
    "Download one from Firebase Console > Project Settings > Service Accounts > Generate new private key.",
  );
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function main() {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Found existing Auth user for ${email} (${userRecord.uid}).`);
  } catch {
    userRecord = await auth.createUser({ email, password, displayName: name });
    console.log(`Created Auth user for ${email} (${userRecord.uid}).`);
  }

  const now = Date.now();
  await db.collection("users").doc(userRecord.uid).set(
    {
      name,
      email,
      role: "admin",
      status: "active",
      lastActivityAt: null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  console.log(
    `\nAdmin account ready. Sign in at /login with:\n  email: ${email}\n  password: ${password}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
