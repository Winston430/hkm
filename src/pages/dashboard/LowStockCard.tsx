import { Package } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { getStockStatus, type Product } from "../../types/product";

export function LowStockCard({ products }: { products: Product[] }) {
  return (
    <Card>
      <CardHeader
        title="Low Stock"
        action={
          products.length > 0 ? (
            <Badge variant="orange">{products.length} items</Badge>
          ) : undefined
        }
      />
      {products.length === 0 ? (
        <EmptyState
          icon={<Package size={22} />}
          title="Stock levels are healthy"
          description="No products are currently below their minimum stock threshold."
        />
      ) : (
        <ul className="flex flex-col">
          {products.slice(0, 6).map((product) => {
            const status = getStockStatus(product);
            return (
              <li
                key={product.id}
                className="flex items-center justify-between gap-3 border-b border-border-light py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-text-primary">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-text-muted">{product.sku}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] text-text-secondary tabular-nums">
                    {product.stock} left
                  </span>
                  <Badge variant={status === "out-of-stock" ? "danger" : "orange"}>
                    {status === "out-of-stock" ? "Out of Stock" : "Low Stock"}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
