import { useEffect, useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { listActiveProducts } from "../../services/products";
import { createSale } from "../../services/sales";
import { formatCurrency } from "../../lib/format";
import { toast } from "../../lib/toast";
import { getStockStatus, type Product } from "../../types/product";
import type { PaymentMethod } from "../../types/sale";
import { MySalesHistory } from "./MySalesHistory";

type PageStatus = "loading" | "success" | "error";

interface CartLine {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export function RecordSale() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  async function loadProducts() {
    setStatus("loading");
    try {
      const data = await listActiveProducts();
      setProducts(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [products, search]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: Math.min(line.quantity + 1, line.maxStock) }
            : line,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.max(1, Math.min(quantity, line.maxStock)) }
          : line,
      ),
    );
  }

  function updatePrice(productId: string, unitPrice: number) {
    setCart((prev) =>
      prev.map((line) =>
        line.productId === productId
          ? { ...line, unitPrice: Math.max(0, unitPrice) }
          : line,
      ),
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  async function handleCompleteSale() {
    if (!profile || cart.length === 0) return;
    setSubmitting(true);
    try {
      const result = await createSale({
        items: cart.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        paymentMethod,
        agentId: profile.id,
        agentName: profile.name,
      });
      const stockByProduct = new Map(
        result.updatedStock.map((s) => [s.productId, s.newQuantity]),
      );
      setProducts((prev) =>
        prev.map((p) =>
          stockByProduct.has(p.id)
            ? { ...p, stock: stockByProduct.get(p.id)! }
            : p,
        ),
      );
      setCart([]);
      setPaymentMethod("cash");
      setHistoryRefreshKey((key) => key + 1);
      toast.success(`Sale completed successfully — ${result.invoiceNumber}`);
    } catch {
      toast.error(
        "Unable to complete sale. Stock may have changed — refresh and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="New Sale" description="Search products and record a sale" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <Card>
            <CardHeader title="Search Products" />
            <SearchInput
              placeholder="Search by name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {status === "loading" && (
              <div className="mt-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} columns={4} />
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="mt-3">
                <ErrorState onRetry={loadProducts} />
              </div>
            )}

            {status === "success" && search.trim() !== "" && results.length === 0 && (
              <p className="mt-4 text-[13px] text-text-muted">
                No products match "{search}".
              </p>
            )}

            {status === "success" && results.length > 0 && (
              <ul className="mt-3 flex flex-col divide-y divide-border-light">
                {results.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const outOfStock = stockStatus === "out-of-stock";
                  return (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-text-primary">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {product.sku} · {formatCurrency(product.sellingPrice)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {stockStatus !== "in-stock" && (
                          <Badge variant={outOfStock ? "danger" : "orange"}>
                            {outOfStock ? "Out of Stock" : `${product.stock} left`}
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Plus size={14} />}
                          disabled={outOfStock}
                          onClick={() => addToCart(product)}
                        >
                          Add
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Cart" />

          {cart.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart size={22} />}
              title="Cart is empty"
              description="Search for a product and add it to start a sale."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <ul className="flex flex-col gap-3">
                {cart.map((line) => (
                  <li key={line.productId} className="flex flex-col gap-2 rounded-md border border-border-light p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-text-primary">
                        {line.productName}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.productId)}
                        aria-label={`Remove ${line.productName}`}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-danger-light hover:text-danger"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-text-muted">Quantity</span>
                        <input
                          type="number"
                          min={1}
                          max={line.maxStock}
                          value={line.quantity}
                          onChange={(e) =>
                            updateQuantity(line.productId, Number(e.target.value))
                          }
                          className="h-8 rounded-md border border-border px-2 text-[13px] focus:border-black focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-text-muted">Unit Price</span>
                        <input
                          type="number"
                          min={0}
                          value={line.unitPrice}
                          onChange={(e) =>
                            updatePrice(line.productId, Number(e.target.value))
                          }
                          className="h-8 rounded-md border border-border px-2 text-[13px] focus:border-black focus:outline-none"
                        />
                      </label>
                    </div>
                    <p className="text-right text-[12px] text-text-secondary">
                      Line total:{" "}
                      <span className="font-medium text-text-primary">
                        {formatCurrency(line.unitPrice * line.quantity)}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>

              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile-money">Mobile Money</option>
              </Select>

              <div className="flex items-center justify-between border-t border-border-light pt-3">
                <span className="text-[13px] font-medium text-text-primary">Total</span>
                <span className="text-[18px] font-semibold tabular-nums text-text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button
                className="w-full"
                disabled={submitting}
                onClick={handleCompleteSale}
              >
                {submitting ? "Completing Sale..." : "Complete Sale"}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {profile && (
        <div className="mt-6">
          <MySalesHistory key={historyRefreshKey} agentId={profile.id} />
        </div>
      )}
    </div>
  );
}
