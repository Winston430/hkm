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
  await updateDoc(doc(db, "users", id), { role, updatedAt });
  return { updatedAt };
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "users", id), { status, updatedAt });
  return { updatedAt };
}
