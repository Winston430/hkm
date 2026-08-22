import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import type { Category } from "../../types/product";

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  category,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  category: Category | null;
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
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(name.trim());
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
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="category-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save Category"}
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
          <p className="rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
