// pages/categories/CategoryFormModal.tsx
import { useEffect, useState, type FormEvent } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { Category } from "../../types/product";

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  category,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  category: Category | null;
  /** Already-loaded category list, used for a client-side duplicate-name
   *  check. Not a substitute for a server-side uniqueness check if one
   *  exists — see note in chat. */
  categories: Category[];
}) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setError(null);
    }
  }, [open, category]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }

    const isDuplicate = categories.some(
      (c) => c.id !== category?.id && c.name.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setError("A category with this name already exists.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch {
      setError("Unable to save category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      width="sm"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" form="category-form" disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Saving
              </span>
            ) : (
              "Save Category"
            )}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="category-name"
          label="Category Name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
          >
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}