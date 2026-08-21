import { ChartBar } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import type { TopProduct } from "../../hooks/useDashboardData";

export function TopProductsCard({ products }: { products: TopProduct[] }) {
  const max = Math.max(1, ...products.map((p) => p.unitsSold));

  return (
    <Card>
      <CardHeader title="Top Products" />
      {products.length === 0 ? (
        <EmptyState
          icon={<ChartBar size={22} />}
          title="No product activity yet"
          description="Top-selling products will appear here once sales are recorded."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product) => (
            <li key={product.productId} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-text-primary">
                    {product.productName}
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-text-secondary">
                    {product.unitsSold} units
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-secondary">
                  <div
                    className="h-1.5 rounded-full bg-black"
                    style={{
                      width: `${Math.max(4, Math.round((product.unitsSold / max) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
