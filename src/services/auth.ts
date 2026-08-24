import {
  browserLocalPersistence,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { clearSession, startSession } from "../lib/session";
import type { AppUser } from "../types/user";

export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}

export async function login(email: string, password: string) {
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  startSession();
  return credential.user;
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await signOut(auth);
  clearSession();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Not signed in");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as AppUser;
}