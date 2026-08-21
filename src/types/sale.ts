export type PaymentMethod = "cash" | "card" | "mobile-money";

export type SaleStatus = "completed" | "refunded" | "cancelled";

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  salespersonId: string;
  salespersonName: string;
  createdAt: number;
}

export type StockMovementReason =
  | "restock"
  | "sale"
  | "adjustment"
  | "damaged"
  | "return";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  change: number;
  newQuantity: number;
  reason: StockMovementReason;
  userId: string;
  userName: string;
  createdAt: number;
}
