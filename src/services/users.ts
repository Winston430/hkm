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
}) {
  const secondaryApp = initializeApp(app.options, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      input.email,
      input.password,
    );

    const now = Date.now();
    await setDoc(doc(db, "users", credential.user.uid), {
      name: input.name,
      email: input.email,
      role: input.role,
      status: "active",
      lastActivityAt: null,
      createdAt: now,
      updatedAt: now,
    });

    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function updateUserRole(id: string, role: UserRole) {
  await updateDoc(doc(db, "users", id), { role, updatedAt: Date.now() });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  await updateDoc(doc(db, "users", id), { status, updatedAt: Date.now() });
}
