import { useEffect, useMemo, useState } from "react";
import { PencilSimple, Plus, Tag, TrashSimple } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import {
  createCategory,
  deleteCategory,
  isCategoryInUse,
  listCategories,
  updateCategory,
} from "../../services/categories";
import type { Category } from "../../types/product";
import { CategoryFormModal } from "./CategoryFormModal";

type Status = "loading" | "success" | "error";

export function Categories() {
  const [status, setStatus] = useState<Status>("loading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  async function load() {
    setStatus("loading");
    try {
      const data = await listCategories();
      setCategories(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setFormOpen(true);
  }

  async function handleSubmit(name: string) {
    if (editing) {
      await updateCategory(editing.id, name);
    } else {
      await createCategory(name);
    }
    await load();
  }

  async function handleDelete() {
    if (!deleting) return;
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
      setDeleting(null);
      await load();
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
          <Button icon={<Plus size={15} />} onClick={openCreate}>
            Add Category
          </Button>
        }
      />

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
              categories.length === 0 ? (
                <Button size="sm" icon={<Plus size={15} />} onClick={openCreate}>
                  Add Category
                </Button>
              ) : undefined
            }
          />
        )}

        {status === "success" && filtered.length > 0 && (
          <Table>
            <TableHead>
              <Th>Name</Th>
              <Th>Actions</Th>
            </TableHead>
            <tbody>
              {filtered.map((category) => (
                <Tr key={category.id}>
                  <Td className="font-medium">{category.name}</Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary"
                      >
                        <PencilSimple size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleting(category);
                          setDeleteError(null);
                        }}
                        aria-label={`Delete ${category.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-danger-light hover:text-danger"
                      >
                        <TrashSimple size={15} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        category={editing}
      />

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
