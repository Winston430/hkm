import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stack } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Pagination } from "../../components/ui/Pagination";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { useAuth } from "../../hooks/useAuth";
import { adjustStock, listStockMovements } from "../../services/inventory";
import { listAllProducts } from "../../services/products";
import { getStockStatus, type Product, type StockStatus } from "../../types/product";
import type { StockMovement, StockMovementReason } from "../../types/sale";
import { toast } from "../../lib/toast";
import { AdjustStockModal } from "./AdjustStockModal";

type PageStatus = "loading" | "success" | "error";

const PRODUCTS_PAGE_SIZE = 10;
const MOVEMENTS_PAGE_SIZE = 10;
const FLASH_DURATION_MS = 900; // matches .row-flash animation length in index.css

const statusFilters: { value: "all" | StockStatus; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

const movementReasonLabel: Record<StockMovementReason, string> = {
  restock: "Restock",
  sale: "Sale",
  adjustment: "Adjustment",
  damaged: "Damaged",
  return: "Return",
};

export function Inventory() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const [productsPage, setProductsPage] = useState(1);
  const [movementsPage, setMovementsPage] = useState(1);

  async function load() {
    setStatus("loading");
    try {
      const [productList, movementList] = await Promise.all([
        listAllProducts(),
        listStockMovements(),
      ]);
      setProducts(productList);
      setMovements(movementList);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" || getStockStatus(p) === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [products, search, statusFilter]);

  useEffect(() => {
    setProductsPage(1);
  }, [search, statusFilter]);

  const productsPageCount = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PAGE_SIZE));
  const pagedProducts = filtered.slice(
    (productsPage - 1) * PRODUCTS_PAGE_SIZE,
    productsPage * PRODUCTS_PAGE_SIZE,
  );

  const movementsPageCount = Math.max(
    1,
    Math.ceil(movements.length / MOVEMENTS_PAGE_SIZE),
  );
  const pagedMovements = movements.slice(
    (movementsPage - 1) * MOVEMENTS_PAGE_SIZE,
    movementsPage * MOVEMENTS_PAGE_SIZE,
  );

  async function handleAdjust(params: {
    change: number;
    reason: StockMovementReason;
  }) {
    if (!adjusting || !profile) return;
    // No try/catch here by design — AdjustStockModal owns error display and
    // only closes itself on success, matching ProductFormModal's pattern
    // for onCreate/onUpdate. Catching here would swallow the rejection
    // before the modal ever sees it.
    const movement = await adjustStock({
      productId: adjusting.id,
      productName: adjusting.name,
      change: params.change,
      reason: params.reason,
      userId: profile.id,
      userName: profile.name,
    });
    setProducts((prev) =>
      prev.map((p) =>
        p.id === adjusting.id
          ? { ...p, stock: movement.newQuantity, updatedAt: movement.createdAt }
          : p,
      ),
    );
    setMovements((prev) => [movement, ...prev]);
    setFlashId(adjusting.id);
    setMovementsPage(1); // surface the new entry immediately
    toast.success("Stock updated successfully.");
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock levels and record adjustments"
      />

      <div className="flex flex-col gap-6">
        <Card padded={false} className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="w-full max-w-xs">
              <SearchInput
                placeholder="Search by name or SKU"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full max-w-[180px]">
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | StockStatus)
                }
              >
                {statusFilters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {status === "loading" && (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} columns={5} />
              ))}
            </div>
          )}

          {status === "error" && <ErrorState onRetry={load} />}

          {status === "success" && filtered.length === 0 && (
            <EmptyState
              icon={<Stack size={22} />}
              title={products.length === 0 ? "No products yet" : "No matches"}
              description={
                products.length === 0
                  ? "Add products first to start tracking inventory."
                  : "Try a different search term or status filter."
              }
              action={
                products.length === 0 ? (
                  <Button size="sm" onClick={() => navigate("/admin/products")}>
                    Go to Products
                  </Button>
                ) : undefined
              }
            />
          )}

          {status === "success" && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <Th>Product</Th>
                    <Th>SKU</Th>
                    <Th>Stock</Th>
                    <Th>Minimum</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </TableHead>
                  <tbody>
                    {pagedProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <Tr
                          key={product.id}
                          className={product.id === flashId ? "row-flash" : undefined}
                        >
                          <Td className="font-medium">{product.name}</Td>
                          <Td className="text-text-secondary">{product.sku}</Td>
                          <Td className="tabular-nums">{product.stock}</Td>
                          <Td className="tabular-nums text-text-secondary">
                            {product.minimumStock}
                          </Td>
                          <Td>
                            <Badge
                              variant={
                                stockStatus === "out-of-stock"
                                  ? "danger"
                                  : stockStatus === "low-stock"
                                    ? "orange"
                                    : "neutral"
                              }
                            >
                              {stockStatus === "out-of-stock"
                                ? "Out of Stock"
                                : stockStatus === "low-stock"
                                  ? "Low Stock"
                                  : "In Stock"}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setAdjusting(product)}
                            >
                              Adjust Stock
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <div className="mt-3">
                <Pagination
                  page={productsPage}
                  pageCount={productsPageCount}
                  onChange={setProductsPage}
                  totalItems={filtered.length}
                  pageSize={PRODUCTS_PAGE_SIZE}
                />
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="Stock Movement History" />
          {status === "loading" && (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} columns={6} />
              ))}
            </div>
          )}
          {status === "success" && movements.length === 0 && (
            <EmptyState
              icon={<Stack size={22} />}
              title="No stock movements yet"
              description="Adjustments you make will be recorded here for audit purposes."
            />
          )}
          {status === "success" && movements.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <Th>Product</Th>
                    <Th>Previous</Th>
                    <Th>Change</Th>
                    <Th>New</Th>
                    <Th>Reason</Th>
                    <Th>By</Th>
                  </TableHead>
                  <tbody>
                    {pagedMovements.map((movement) => (
                      <Tr key={movement.id}>
                        <Td className="font-medium">{movement.productName}</Td>
                        <Td className="tabular-nums text-text-secondary">
                          {movement.previousQuantity}
                        </Td>
                        <Td
                          className={`tabular-nums font-medium ${
                            movement.change > 0
                              ? "text-success"
                              : movement.change < 0
                                ? "text-danger"
                                : "text-text-primary"
                          }`}
                        >
                          {movement.change >= 0 ? "+" : ""}
                          {movement.change}
                        </Td>
                        <Td className="tabular-nums">{movement.newQuantity}</Td>
                        <Td className="text-text-secondary">
                          {movementReasonLabel[movement.reason]}
                        </Td>
                        <Td className="text-text-secondary">{movement.userName}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <div className="mt-3">
                <Pagination
                  page={movementsPage}
                  pageCount={movementsPageCount}
                  onChange={setMovementsPage}
                  totalItems={movements.length}
                  pageSize={MOVEMENTS_PAGE_SIZE}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      <AdjustStockModal
        open={adjusting !== null}
        onClose={() => setAdjusting(null)}
        product={adjusting}
        onSubmit={handleAdjust}
      />
    </div>
  );
}