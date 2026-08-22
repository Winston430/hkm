import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { BusinessProfile } from "../types/settings";

const businessDocRef = doc(db, "settings", "business");

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const snapshot = await getDoc(businessDocRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as BusinessProfile;
}

export async function saveBusinessProfile(
  profile: Omit<BusinessProfile, "updatedAt">,
) {
  await setDoc(businessDocRef, { ...profile, updatedAt: Date.now() });
}
