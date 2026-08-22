import {
  collection,
  doc,
  limit as fsLimit,
  getDocs,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { adjustStock } from "./inventory";
import type { PaymentMethod, Sale, SaleItem } from "../types/sale";

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

/** Sales recorded by one agent, newest-first. Used for their own recent-activity view. */
export async function listSalesByAgent(
  agentId: string,
  max = 10,
): Promise<Sale[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "sales"),
      where("agentId", "==", agentId),
      orderBy("createdAt", "desc"),
      fsLimit(max),
    ),
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Sale);
}

function generateInvoiceNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
}

export interface CreateSaleItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Records a sale and decrements stock for every item in one transaction, so a
 * sale can never exist without the matching stock reduction (or vice versa).
 * Also writes a "sale" stock_movement per item for the audit trail.
 */
export async function createSale(params: {
  items: CreateSaleItemInput[];
  paymentMethod: PaymentMethod;
  agentId: string;
  agentName: string;
}): Promise<{
  id: string;
  invoiceNumber: string;
  updatedStock: { productId: string; newQuantity: number }[];
}> {
  if (params.items.length === 0) {
    throw new Error("A sale needs at least one item");
  }

  const saleRef = doc(collection(db, "sales"));
  const invoiceNumber = generateInvoiceNumber();
  const productRefs = params.items.map((item) =>
    doc(db, "products", item.productId),
  );
  const movementRefs = params.items.map(() => doc(collection(db, "stock_movements")));
  const updatedStock: { productId: string; newQuantity: number }[] = [];

  await runTransaction(db, async (transaction) => {
    const snapshots = await Promise.all(
      productRefs.map((ref) => transaction.get(ref)),
    );

    const saleItems: SaleItem[] = [];
    let totalAmount = 0;
    updatedStock.length = 0;

    snapshots.forEach((snapshot, index) => {
      const item = params.items[index];
      if (!snapshot.exists()) {
        throw new Error(`Product not found: ${item.productName}`);
      }

      const previousQuantity = (snapshot.data().stock as number) ?? 0;
      if (previousQuantity < item.quantity) {
        throw new Error(`Not enough stock for ${item.productName}`);
      }
      const newQuantity = previousQuantity - item.quantity;
      updatedStock.push({ productId: item.productId, newQuantity });

      transaction.update(productRefs[index], {
        stock: newQuantity,
        updatedAt: Date.now(),
      });

      transaction.set(movementRefs[index], {
        productId: item.productId,
        productName: item.productName,
        previousQuantity,
        change: -item.quantity,
        newQuantity,
        reason: "sale",
        userId: params.agentId,
        userName: params.agentName,
        createdAt: Date.now(),
      });

      const lineTotal = item.unitPrice * item.quantity;
      totalAmount += lineTotal;
      saleItems.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
      });
    });

    transaction.set(saleRef, {
      invoiceNumber,
      items: saleItems,
      totalAmount,
      paymentMethod: params.paymentMethod,
      status: "completed",
      agentId: params.agentId,
      agentName: params.agentName,
      createdAt: Date.now(),
    });
  });

  return { id: saleRef.id, invoiceNumber, updatedStock };
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
