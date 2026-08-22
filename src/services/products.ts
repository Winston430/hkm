import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product } from "../types/product";

const productsRef = collection(db, "products");

export async function listActiveProducts(): Promise<Product[]> {
  const snapshot = await getDocs(
    query(productsRef, where("active", "==", true)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export async function listAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(query(productsRef, orderBy("name", "asc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}

export type ProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt" | "stock"
> & { stock?: number };

export async function createProduct(input: ProductInput) {
  const now = Date.now();
  await addDoc(productsRef, {
    ...input,
    stock: input.stock ?? 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateProduct(
  id: string,
  input: Omit<ProductInput, "stock">,
) {
  await updateDoc(doc(db, "products", id), {
    ...input,
    updatedAt: Date.now(),
  });
}

export async function setProductActive(id: string, active: boolean) {
  await updateDoc(doc(db, "products", id), {
    active,
    updatedAt: Date.now(),
  });
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id));
}

export async function isSkuTaken(sku: string, excludeId?: string) {
  const snapshot = await getDocs(query(productsRef, where("sku", "==", sku)));
  return snapshot.docs.some((d) => d.id !== excludeId);
}
