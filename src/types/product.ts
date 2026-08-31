export interface Category {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  image: string | null;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function getStockStatus(product: Pick<Product, "stock" | "minimumStock">): StockStatus {
  if (product.stock <= 0) return "out-of-stock";
  if (product.stock <= product.minimumStock) return "low-stock";
  return "in-stock";
}
