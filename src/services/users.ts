import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app, db } from "../lib/firebase";
import type { AppUser, UserRole, UserStatus } from "../types/user";
import type { Permission } from "../types/permissions";

const usersRef = collection(db, "users");

export async function listUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(query(usersRef, orderBy("name", "asc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser);
}

/**
 * Creates a Firebase Auth account + user profile without disturbing the
 * currently signed-in admin session. The client SDK signs in as whichever
 * user was just created, so the account is created on a throwaway secondary
 * app instance and immediately torn down.
 */
export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
}): Promise<AppUser> {
  const secondaryApp = initializeApp(app.options, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email,
      input.password,
    );

    const now = Date.now();
    const profile: Omit<AppUser, "id"> = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: "active",
      // Admins bypass checks via role and don't need grants stored;
      // agents get whatever was picked in the form.
      permissions: input.role === "admin" ? [] : input.permissions,
      lastActivityAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", credential.user.uid), profile);
    await signOut(secondaryAuth);

    return { id: credential.user.uid, ...profile };
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function updateUserRole(id: string, role: UserRole): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  // Demoting an admin to agent leaves their old (empty) permissions array
  // in place — they'll show zero access until someone explicitly grants
  // some via Edit Permissions. Promoting to admin doesn't touch the field
  // at all; it's simply ignored once role checks take over.
  await updateDoc(doc(db, "users", id), { role, updatedAt });
  return { updatedAt };
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "users", id), { status, updatedAt });
  return { updatedAt };
}

export async function updateUserPermissions(
  id: string,
  permissions: Permission[],
): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "users", id), { permissions, updatedAt });
  return { updatedAt };
}