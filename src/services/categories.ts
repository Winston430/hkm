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

// Categories change rarely but are read on almost every product-related
// screen (list, filters, forms). Cache them in memory for the session and
// keep the cache in sync on writes, instead of re-querying Firestore every
// time a different page needs the list.
let categoriesCache: Category[] | null = null;

function sortByName(categories: Category[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;
  const snapshot = await getDocs(query(categoriesRef, orderBy("name", "asc")));
  categoriesCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
  return categoriesCache;
}

export async function createCategory(name: string): Promise<Category> {
  const now = Date.now();
  const ref = await addDoc(categoriesRef, {
    name,
    createdAt: now,
    updatedAt: now,
  });
  const created = { id: ref.id, name, createdAt: now, updatedAt: now };
  if (categoriesCache) categoriesCache = sortByName([...categoriesCache, created]);
  return created;
}

export async function updateCategory(id: string, name: string): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "categories", id), { name, updatedAt });
  if (categoriesCache) {
    categoriesCache = sortByName(
      categoriesCache.map((c) => (c.id === id ? { ...c, name, updatedAt } : c)),
    );
  }
  return { updatedAt };
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
  if (categoriesCache) {
    categoriesCache = categoriesCache.filter((c) => c.id !== id);
  }
}
