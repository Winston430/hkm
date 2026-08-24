import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DotsThreeVertical, DownloadSimple, Package, Plus } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Pagination } from "../../components/ui/Pagination";
import { Dropdown, DropdownItem } from "../../components/ui/Dropdown";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { listCategories } from "../../services/categories";
import {
  createProduct,
  deleteProduct,
  listAllProducts,
  setProductActive,
  updateProduct,
  type ProductInput,
} from "../../services/products";
import { formatCurrency } from "../../lib/format";
import { exportToCsv } from "../../lib/exportCsv";
import { getStockStatus, type Category, type Product } from "../../types/product";
import { toast } from "../../lib/toast";
import { ProductFormModal } from "./ProductFormModal";

type Status = "loading" | "success" | "error";
const PAGE_SIZE = 10;
const FLASH_DURATION_MS = 900; // matches .row-flash animation length in index.css

export function Products() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [needsCategoryNotice, setNeedsCategoryNotice] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const [productList, categoryList] = await Promise.all([
        listAllProducts(),
        listCategories(),
      ]);
      setProducts(productList);
      setCategories(categoryList);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Clears the row-flash highlight after it finishes animating, so the
  // same row can flash again on a subsequent edit.
  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  const categoryName = useMemo(() => {
    const map = new Map(categories.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [categories]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" || p.categoryId === categoryFilter;
      return matchesTerm && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  function openCreate() {
    if (categories.length === 0) {
      setNeedsCategoryNotice(true);
      return;
    }
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleCreate(input: ProductInput) {
    const created = await createProduct(input);
    setProducts((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setFlashId(created.id);
    toast.success("Product saved successfully.");
  }

  async function handleUpdate(id: string, input: Omit<ProductInput, "stock">) {
    const { updatedAt } = await updateProduct(id, input);
    setProducts((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, ...input, updatedAt } : p))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setFlashId(id);
    toast.success("Product saved successfully.");
  }

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    try {
      const { updatedAt } = await setProductActive(product.id, !product.active);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, active: !product.active, updatedAt } : p,
        ),
      );
      setFlashId(product.id);
      toast.success(product.active ? "Product deactivated." : "Product activated.");
    } catch {
      toast.error("Unable to update product status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteSubmitting(true);
    try {
      await deleteProduct(deleting.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
      toast.success("Product deleted successfully.");
    } catch {
      toast.error("Unable to delete product.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  function handleExport() {
    exportToCsv(
      "products",
      filtered.map((product) => ({
        Name: product.name,
        SKU: product.sku,
        Category: categoryName(product.categoryId),
        "Cost Price": product.costPrice,
        "Selling Price": product.sellingPrice,
        Stock: product.stock,
        "Minimum Stock": product.minimumStock,
        Status: product.active ? "Active" : "Inactive",
      })),
    );
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, and stock thresholds"
        action={
          <>
            <Button
              variant="secondary"
              icon={<DownloadSimple size={15} />}
              onClick={handleExport}
              disabled={status !== "success" || filtered.length === 0}
            >
              Export CSV
            </Button>
            <Button icon={<Plus size={15} />} onClick={openCreate}>
              Add Product
            </Button>
          </>
        }
      />

      <Card padded={false} className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-full max-w-xs">
            <SearchInput
              placeholder="Search by name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[200px]">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {status === "loading" && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} columns={6} />
            ))}
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && filtered.length === 0 && (
          <EmptyState
            icon={<Package size={22} />}
            title={products.length === 0 ? "No products yet" : "No matches"}
            description={
              products.length === 0
                ? "Add your first product to begin managing your stationery inventory."
                : "Try a different search term or category."
            }
            action={
              products.length === 0 ? (
                <Button size="sm" icon={<Plus size={15} />} onClick={openCreate}>
                  Add Product
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
                  <Th>Category</Th>
                  <Th>Selling Price</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </TableHead>
                <tbody>
                  {paged.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isToggling = togglingId === product.id;
                    return (
                      <Tr
                        key={product.id}
                        className={product.id === flashId ? "row-flash" : undefined}
                      >
                        <Td className="font-medium">{product.name}</Td>
                        <Td className="text-text-secondary">{product.sku}</Td>
                        <Td className="text-text-secondary">
                          {categoryName(product.categoryId)}
                        </Td>
                        <Td className="tabular-nums">
                          {formatCurrency(product.sellingPrice)}
                        </Td>
                        <Td>
                          {stockStatus === "in-stock" ? (
                            <span className="tabular-nums text-text-primary">
                              {product.stock}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="tabular-nums text-text-primary">
                                {product.stock}
                              </span>
                              <Badge
                                variant={
                                  stockStatus === "out-of-stock" ? "danger" : "orange"
                                }
                              >
                                {stockStatus === "out-of-stock"
                                  ? "Out of Stock"
                                  : "Low Stock"}
                              </Badge>
                            </div>
                          )}
                        </Td>
                        <Td>
                          <Badge variant="neutral">
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </Td>
                        <Td>
                          <Dropdown
                            trigger={
                              <button
                                type="button"
                                aria-label={`Actions for ${product.name}`}
                                aria-haspopup="menu"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                              >
                                <DotsThreeVertical size={16} weight="bold" />
                              </button>
                            }
                          >
                            <DropdownItem onClick={() => openEdit(product)}>
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              disabled={isToggling}
                              onClick={() => handleToggleActive(product)}
                            >
                              {isToggling
                                ? "Updating…"
                                : product.active
                                  ? "Deactivate"
                                  : "Activate"}
                            </DropdownItem>
                            <DropdownItem danger onClick={() => setDeleting(product)}>
                              Delete
                            </DropdownItem>
                          </Dropdown>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            <div className="mt-3">
              <Pagination
                page={page}
                pageCount={pageCount}
                onChange={setPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          </>
        )}
      </Card>

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        product={editing}
        categories={categories}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete product"
        description={`Are you sure you want to delete "${deleting?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        danger
        submitting={deleteSubmitting}
      />

      <Modal
        open={needsCategoryNotice}
        onClose={() => setNeedsCategoryNotice(false)}
        title="Add a category first"
        width="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setNeedsCategoryNotice(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={() => navigate("/admin/categories")}>
              Go to Categories
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-text-secondary">
          Products need a category. Create at least one category before adding
          a product.
        </p>
      </Modal>
    </div>
  );
}