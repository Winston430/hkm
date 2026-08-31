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

export async function createProduct(input: ProductInput): Promise<Product> {
  const now = Date.now();
  const stock = input.stock ?? 0;
  const ref = await addDoc(productsRef, {
    ...input,
    stock,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, ...input, stock, createdAt: now, updatedAt: now };
}

export async function updateProduct(
  id: string,
  input: Omit<ProductInput, "stock">,
): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "products", id), { ...input, updatedAt });
  return { updatedAt };
}

export async function setProductActive(id: string, active: boolean): Promise<{ updatedAt: number }> {
  const updatedAt = Date.now();
  await updateDoc(doc(db, "products", id), { active, updatedAt });
  return { updatedAt };
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id));
}

export async function isSkuTaken(sku: string, excludeId?: string) {
  const snapshot = await getDocs(query(productsRef, where("sku", "==", sku)));
  return snapshot.docs.some((d) => d.id !== excludeId);
}
