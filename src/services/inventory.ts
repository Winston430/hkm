import {
  collection,
  doc,
  getDocs,
  limit as fsLimit,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { StockMovement, StockMovementReason } from "../types/sale";

export async function listStockMovements(max = 50): Promise<StockMovement[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "stock_movements"),
      orderBy("createdAt", "desc"),
      fsLimit(max),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as StockMovement);
}

export async function adjustStock(params: {
  productId: string;
  productName: string;
  change: number;
  reason: StockMovementReason;
  userId: string;
  userName: string;
}) {
  const { productId, productName, change, reason, userId, userName } = params;
  const productRef = doc(db, "products", productId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(productRef);
    if (!snapshot.exists()) throw new Error("Product not found");

    const previousQuantity = (snapshot.data().stock as number) ?? 0;
    const newQuantity = Math.max(0, previousQuantity + change);

    transaction.update(productRef, {
      stock: newQuantity,
      updatedAt: Date.now(),
    });

    const movementRef = doc(collection(db, "stock_movements"));
    transaction.set(movementRef, {
      productId,
      productName,
      previousQuantity,
      change: newQuantity - previousQuantity,
      newQuantity,
      reason,
      userId,
      userName,
      createdAt: Date.now(),
    });
  });
}
