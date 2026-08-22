import { useMemo } from "react";
import { Card, CardHeader } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/format";
import { getStockStatus, type Product } from "../../types/product";

export function InventoryReportCard({ products }: { products: Product[] }) {
  const stats = useMemo(() => {
    const active = products.filter((p) => p.active);
    const totalUnits = active.reduce((sum, p) => sum + p.stock, 0);
    const stockValue = active.reduce(
      (sum, p) => sum + p.stock * p.costPrice,
      0,
    );
    const lowStock = active.filter(
      (p) => getStockStatus(p) === "low-stock",
    ).length;
    const outOfStock = active.filter(
      (p) => getStockStatus(p) === "out-of-stock",
    ).length;
    return {
      productCount: active.length,
      totalUnits,
      stockValue,
      lowStock,
      outOfStock,
    };
  }, [products]);

  return (
    <Card>
      <CardHeader title="Inventory Report" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase text-text-muted">Active Products</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {stats.productCount}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Stock Units</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {stats.totalUnits}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Stock Value</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-text-primary">
            {formatCurrency(stats.stockValue)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Low Stock</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-orange-dark">
            {stats.lowStock}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-text-muted">Out of Stock</p>
          <p className="mt-1 text-[20px] font-semibold tabular-nums text-danger">
            {stats.outOfStock}
          </p>
        </div>
      </div>
    </Card>
  );
}
