import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Category } from "../types/product";

const categoriesRef = collection(db, "categories");

export async function listCategories(): Promise<Category[]> {
  const snapshot = await getDocs(query(categoriesRef, orderBy("name", "asc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function createCategory(name: string) {
  const now = Date.now();
  await addDoc(categoriesRef, {
    name,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateCategory(id: string, name: string) {
  await updateDoc(doc(db, "categories", id), {
    name,
    updatedAt: Date.now(),
  });
}

export async function isCategoryInUse(categoryId: string): Promise<boolean> {
  const snapshot = await getDocs(
    query(
      collection(db, "products"),
      where("categoryId", "==", categoryId),
      limit(1),
    ),
  );
  return !snapshot.empty;
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}
