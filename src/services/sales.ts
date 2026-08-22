import {
  collection,
  doc,
  limit as fsLimit,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { adjustStock } from "./inventory";
import type { Sale } from "../types/sale";

/** Sales ordered newest-first, optionally restricted to createdAt >= sinceMs. */
export async function listSalesSince(
  sinceMs: number,
  max = 300,
): Promise<Sale[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "sales"),
      where("createdAt", ">=", sinceMs),
      orderBy("createdAt", "desc"),
      fsLimit(max),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Sale);
}

export async function listAllSales(max = 500): Promise<Sale[]> {
  const snapshot = await getDocs(
    query(collection(db, "sales"), orderBy("createdAt", "desc"), fsLimit(max)),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Sale);
}

/** Marks a completed sale as refunded and returns its items to stock. */
export async function refundSale(sale: Sale, userId: string, userName: string) {
  for (const item of sale.items) {
    await adjustStock({
      productId: item.productId,
      productName: item.productName,
      change: item.quantity,
      reason: "return",
      userId,
      userName,
    });
  }
  await updateDoc(doc(db, "sales", sale.id), { status: "refunded" });
}
