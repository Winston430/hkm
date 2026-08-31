// pages/categories/Categories.tsx
import { useEffect, useMemo, useState } from "react";
import {
  ChartBar,
  Package,
  PencilSimple,
  Plus,
  Prohibit,
  Tag,
  TrashSimple,
} from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { MetricCard } from "../../components/ui/MetricCard";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import {
  createCategory,
  deleteCategory,
  isCategoryInUse,
  listCategories,
  updateCategory,
} from "../../services/categories";
import { listAllProducts } from "../../services/products";
import { useAuth } from "../../hooks/useAuth";
import type { Category, Product } from "../../types/product";
import { toast } from "../../lib/toast";
import { CategoryFormModal } from "./CategoryFormModal";

type Status = "loading" | "success" | "error";
const FLASH_DURATION_MS = 900;

const rowActionButton =
  "flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35";

export function Categories() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("categories.create");
  const canEdit = hasPermission("categories.edit");
  const canDelete = hasPermission("categories.delete");

  const [status, setStatus] = useState<Status>("loading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const [categoryList, productList] = await Promise.all([
        listCategories(),
        listAllProducts(),
      ]);
      setCategories(categoryList);
      setProducts(productList);
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

  const stats = useMemo(() => {
    const categoryIds = new Set(categories.map((c) => c.id));
    const productCountByCategory = new Map<string, number>();
    let categorizedProducts = 0;

    for (const product of products) {
      if (!categoryIds.has(product.categoryId)) continue;
      categorizedProducts++;
      productCountByCategory.set(
        product.categoryId,
        (productCountByCategory.get(product.categoryId) ?? 0) + 1,
      );
    }

    const emptyCategories = categories.filter(
      (c) => !productCountByCategory.has(c.id),
    ).length;

    const avgPerCategory =
      categories.length === 0 ? 0 : categorizedProducts / categories.length;

    return {
      totalCategories: categories.length,
      categorizedProducts,
      emptyCategories,
      avgPerCategory,
    };
  }, [categories, products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  function openCreate() {
    if (!canCreate) return;
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    if (!canEdit) return;
    setEditing(category);
    setFormOpen(true);
  }

  async function handleSubmit(name: string) {
    if (editing) {
      const { updatedAt } = await updateCategory(editing.id, name);
      setCategories((prev) =>
        prev
          .map((c) => (c.id === editing.id ? { ...c, name, updatedAt } : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setFlashId(editing.id);
      toast.success("Category updated successfully.");
    } else {
      const created = await createCategory(name);
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setFlashId(created.id);
      toast.success("Category created successfully.");
    }
  }

  async function handleDelete() {
    if (!deleting || !canDelete) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      const inUse = await isCategoryInUse(deleting.id);
      if (inUse) {
        setDeleteError(
          "This category is assigned to one or more products and can't be deleted.",
        );
        return;
      }
      await deleteCategory(deleting.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
      setDeleting(null);
      toast.success("Category deleted successfully.");
    } catch {
      setDeleteError("Unable to delete category. Please try again.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group products for easier browsing and reporting"
        action={
          canCreate ? (
            <Button icon={<Plus size={15} />} onClick={openCreate}>
              Add Category
            </Button>
          ) : undefined
        }
      />

      {status === "loading" && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4">
              <div className="skeleton mb-3 h-3 w-20" />
              <div className="skeleton h-7 w-16" />
            </div>
          ))}
        </div>
      )}

      {status === "success" && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Total Categories"
            value={String(stats.totalCategories)}
            icon={<Tag size={16} />}
          />
          <MetricCard
            label="Categorized Products"
            value={String(stats.categorizedProducts)}
            icon={<Package size={16} />}
          />
          <MetricCard
            label="Empty Categories"
            value={String(stats.emptyCategories)}
            tone={stats.emptyCategories > 0 ? "attention" : "default"}
            icon={<Prohibit size={16} />}
          />
          <MetricCard
            label="Avg Products / Category"
            value={stats.avgPerCategory.toFixed(1)}
            icon={<ChartBar size={16} />}
          />
        </div>
      )}

      <Card padded={false} className="p-5">
        <div className="mb-4 max-w-xs">
          <SearchInput
            placeholder="Search categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {status === "loading" && (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} columns={2} />
            ))}
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && filtered.length === 0 && (
          <EmptyState
            icon={<Tag size={22} />}
            title={categories.length === 0 ? "No categories yet" : "No matches"}
            description={
              categories.length === 0
                ? "Add your first category to start organizing products."
                : "Try a different search term."
            }
            action={
              categories.length === 0 && canCreate ? (
                <Button size="sm" icon={<Plus size={15} />} onClick={openCreate}>
                  Add Category
                </Button>
              ) : undefined
            }
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <Th>Name</Th>
                {(canEdit || canDelete) && <Th>Actions</Th>}
              </TableHead>
              <tbody>
                {filtered.map((category) => (
                  <Tr
                    key={category.id}
                    className={category.id === flashId ? "row-flash" : undefined}
                  >
                    <Td className="font-medium">{category.name}</Td>
                    {(canEdit || canDelete) && (
                      <Td>
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => openEdit(category)}
                              aria-label={`Edit ${category.name}`}
                              className={`${rowActionButton} hover:bg-surface-secondary hover:text-text-primary`}
                            >
                              <PencilSimple size={15} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleting(category);
                                setDeleteError(null);
                              }}
                              aria-label={`Delete ${category.name}`}
                              className={`${rowActionButton} hover:bg-danger-light hover:text-danger`}
                            >
                              <TrashSimple size={15} />
                            </button>
                          )}
                        </div>
                      </Td>
                    )}
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {(canCreate || canEdit) && (
        <CategoryFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          category={editing}
          categories={categories}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete category"
        description={
          deleteError ??
          `Are you sure you want to delete "${deleting?.name}"? This can't be undone.`
        }
        confirmLabel="Delete"
        danger
        submitting={deleteSubmitting}
      />
    </div>
  );
}