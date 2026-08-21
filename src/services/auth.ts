import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { AppUser } from "../types/user";

export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}

export async function login(email: string, password: string) {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as AppUser;
}
