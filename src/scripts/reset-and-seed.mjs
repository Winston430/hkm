#!/usr/bin/env node
// reset-and-seed.mjs
//
// DESTRUCTIVE. Deletes every document in every Firestore collection and
// every Firebase Auth user in the target project, then creates a single
// admin account to start fresh from.
//
// Requires the Firebase Admin SDK service account key (Console > Project
// Settings > Service Accounts > Generate new private key). NEVER commit
// that file. Run with:
//
//   node reset-and-seed.mjs /path/to/serviceAccountKey.json
//
// npm install firebase-admin   (one-time, in whatever folder you run this from)

import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const NEW_ADMIN_EMAIL = "admin@hkm.co.tz";
const NEW_ADMIN_PASSWORD = "20052oo5";
const NEW_ADMIN_NAME = "Admin";

const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error("Usage: node reset-and-seed.mjs /path/to/serviceAccountKey.json");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
const projectId = serviceAccount.project_id;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

async function confirm() {
  console.log("");
  console.log("⚠️  THIS WILL PERMANENTLY DELETE:");
  console.log(`   • Every document in every Firestore collection in "${projectId}"`);
  console.log(`   • Every Firebase Auth user in "${projectId}"`);
  console.log("   This cannot be undone.");
  console.log("");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Type the project ID ("${projectId}") to confirm: `);
  rl.close();

  if (answer.trim() !== projectId) {
    console.log("Confirmation did not match. Aborting — nothing was deleted.");
    process.exit(1);
  }
}

async function wipeFirestore() {
  console.log("\nWiping Firestore...");
  const collections = await db.listCollections();

  if (collections.length === 0) {
    console.log("  No collections found.");
    return;
  }

  for (const col of collections) {
    process.stdout.write(`  Deleting collection "${col.id}"... `);
    // recursiveDelete handles pagination and subcollections for us —
    // safe for collections of any size, not just small test data.
    await db.recursiveDelete(col);
    console.log("done.");
  }
}

async function wipeAuthUsers() {
  console.log("\nWiping Auth users...");
  let uids = [];
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    uids.push(...result.users.map((u) => u.uid));
    pageToken = result.pageToken;
  } while (pageToken);

  if (uids.length === 0) {
    console.log("  No users found.");
    return;
  }

  console.log(`  Found ${uids.length} user(s). Deleting in batches of 1000...`);
  for (let i = 0; i < uids.length; i += 1000) {
    const batch = uids.slice(i, i + 1000);
    const result = await auth.deleteUsers(batch);
    console.log(`  Deleted ${result.successCount}, failed ${result.failureCount}.`);
    if (result.failureCount > 0) {
      for (const err of result.errors) {
        console.error(`    - ${uids[err.index]}: ${err.error.message}`);
      }
    }
  }
}

async function createFirstAdmin() {
  console.log("\nCreating first admin user...");

  const userRecord = await auth.createUser({
    email: NEW_ADMIN_EMAIL,
    password: NEW_ADMIN_PASSWORD,
    displayName: NEW_ADMIN_NAME,
  });

  const now = Date.now();
  await db.doc(`users/${userRecord.uid}`).set({
    name: NEW_ADMIN_NAME,
    email: NEW_ADMIN_EMAIL,
    role: "admin",
    status: "active",
    permissions: [], // admins bypass permission checks via role — no grants needed
    lastActivityAt: null,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  Created: ${NEW_ADMIN_EMAIL} (uid: ${userRecord.uid})`);
}

async function main() {
  await confirm();
  await wipeFirestore();
  await wipeAuthUsers();
  await createFirstAdmin();
  console.log("\nDone. The project is reset with one admin account.");
  console.log(`  Email:    ${NEW_ADMIN_EMAIL}`);
  console.log(`  Password: ${NEW_ADMIN_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\nScript failed:", err);
  process.exit(1);
});