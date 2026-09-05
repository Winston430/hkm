import { Link } from "react-router-dom";
import { ArrowRight, Package } from "@phosphor-icons/react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { getStockStatus, productUnitLabel, type Product } from "../../types/product";

const VISIBLE_LIMIT = 6;

export function LowStockCard({ products }: { products: Product[] }) {
  // Out-of-stock first — more urgent than "low but still sellable."
  const sorted = [...products].sort((a, b) => {
    const aOut = getStockStatus(a) === "out-of-stock" ? 0 : 1;
    const bOut = getStockStatus(b) === "out-of-stock" ? 0 : 1;
    return aOut - bOut;
  });
  const visible = sorted.slice(0, VISIBLE_LIMIT);
  const remaining = sorted.length - visible.length;

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
        <>
          <ul className="flex flex-col">
            {visible.map((product) => {
              const status = getStockStatus(product);
              return (
                <li key={product.id} className="border-b border-border-light last:border-b-0">
                  <Link
                    to={`/admin/inventory?search=${encodeURIComponent(product.name)}`}
                    className="flex items-center justify-between gap-3 rounded-sm py-2.5 transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-text-primary">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {productUnitLabel[product.unit] ?? "—"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[12px] text-text-secondary tabular-nums">
                        {product.stock} left
                      </span>
                      <Badge variant={status === "out-of-stock" ? "danger" : "orange"}>
                        {status === "out-of-stock" ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {remaining > 0 && (
            <Link
              to="/admin/inventory"
              className="mt-2 flex items-center gap-1 rounded-sm text-[12px] font-medium text-orange-dark transition-colors duration-150 hover:text-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
            >
              +{remaining} more — view Inventory
              <ArrowRight size={12} />
            </Link>
          )}
        </>
      )}
    </Card>
  );
}