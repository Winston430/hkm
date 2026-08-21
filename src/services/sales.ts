import {
  collection,
  limit as fsLimit,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
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
