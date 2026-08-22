import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { isSkuTaken, type ProductInput } from "../../services/products";
import type { Category, Product } from "../../types/product";

interface FormState {
  name: string;
  sku: string;
  categoryId: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  minimumStock: string;
  image: string;
  active: boolean;
}

function emptyForm(defaultCategoryId: string): FormState {
  return {
    name: "",
    sku: "",
    categoryId: defaultCategoryId,
    costPrice: "",
    sellingPrice: "",
    stock: "0",
    minimumStock: "5",
    image: "",
    active: true,
  };
}

function toForm(product: Product): FormState {
  return {
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    costPrice: String(product.costPrice),
    sellingPrice: String(product.sellingPrice),
    stock: String(product.stock),
    minimumStock: String(product.minimumStock),
    image: product.image ?? "",
    active: product.active,
  };
}

export function ProductFormModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  product,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: ProductInput) => Promise<void>;
  onUpdate: (id: string, input: Omit<ProductInput, "stock">) => Promise<void>;
  product: Product | null;
  categories: Category[];
}) {
  const [form, setForm] = useState<FormState>(emptyForm(categories[0]?.id ?? ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(product ? toForm(product) : emptyForm(categories[0]?.id ?? ""));
      setError(null);
    }
  }, [open, product, categories]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.sku.trim() || !form.categoryId) {
      setError("Name, SKU, and category are required.");
      return;
    }

    const costPrice = Number(form.costPrice) || 0;
    const sellingPrice = Number(form.sellingPrice);
    const minimumStock = Number(form.minimumStock) || 0;
    const stock = Number(form.stock) || 0;

    if (!sellingPrice || sellingPrice <= 0) {
      setError("Enter a valid selling price.");
      return;
    }

    setSubmitting(true);
    try {
      const taken = await isSkuTaken(form.sku.trim(), product?.id);
      if (taken) {
        setError("A product with this SKU already exists.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        costPrice,
        sellingPrice,
        minimumStock,
        image: form.image.trim() || null,
        active: form.active,
      };

      if (product) {
        await onUpdate(product.id, payload);
      } else {
        await onCreate({ ...payload, stock });
      }
      onClose();
    } catch {
      setError("Unable to save product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Edit Product" : "Add Product"}
      width="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="product-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save Product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="product-name"
            label="Product Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <Input
            id="product-sku"
            label="SKU"
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="product-category"
            label="Category"
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            id="product-image"
            label="Image URL (optional)"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Input
            id="product-cost"
            label="Cost Price"
            type="number"
            min="0"
            value={form.costPrice}
            onChange={(e) => set("costPrice", e.target.value)}
          />
          <Input
            id="product-price"
            label="Selling Price"
            type="number"
            min="0"
            value={form.sellingPrice}
            onChange={(e) => set("sellingPrice", e.target.value)}
          />
          {!product && (
            <Input
              id="product-stock"
              label="Initial Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          )}
          <Input
            id="product-min-stock"
            label="Minimum Stock"
            type="number"
            min="0"
            value={form.minimumStock}
            onChange={(e) => set("minimumStock", e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-black"
          />
          Active (visible for sale)
        </label>

        {error && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
