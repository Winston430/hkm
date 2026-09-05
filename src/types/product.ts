export interface Category {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export type ProductUnit =
  | "pcs" | "doz" | "ctn" | "pack" | "ream" | "box" | "set" | "jar" | "bottle" | "roll";

export const productUnitLabel: Record<ProductUnit, string> = {
  pcs: "Pcs",
  doz: "Doz",
  ctn: "Ctn",
  pack: "Pack",
  ream: "Ream",
  box: "Box",
  set: "Set",
  jar: "Jar",
  bottle: "Bottle",
  roll: "Roll",
};

export interface Product {
  id: string;
  name: string;
  unit: ProductUnit;
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