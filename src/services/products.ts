import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product } from "../types/product";

export async function listActiveProducts(): Promise<Product[]> {
  const snapshot = await getDocs(
    query(collection(db, "products"), where("active", "==", true)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
}
