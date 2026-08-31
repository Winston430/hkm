import { useEffect, useState, type FormEvent } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { isSkuTaken, type ProductInput } from "../../services/products";
import { formatCurrency } from "../../lib/format";
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

/** Blank -> 0 (fields are optional-with-a-default). Anything non-numeric
 *  or negative -> null, so the caller can reject it instead of silently
 *  saving a wrong number. */
function parseNonNegativeNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
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

  // Live margin preview — informational only, doesn't block submission.
  const costPreview = Number(form.costPrice);
  const pricePreview = Number(form.sellingPrice);
  const canShowMargin =
    form.costPrice.trim() !== "" &&
    form.sellingPrice.trim() !== "" &&
    Number.isFinite(costPreview) &&
    Number.isFinite(pricePreview);
  const marginAmount = canShowMargin ? pricePreview - costPreview : 0;
  const marginPercent =
    canShowMargin && costPreview > 0 ? (marginAmount / costPreview) * 100 : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    const trimmedSku = form.sku.trim();

    if (!trimmedName || !trimmedSku || !form.categoryId) {
      setError("Name, SKU, and category are required.");
      return;
    }

    const costPrice = parseNonNegativeNumber(form.costPrice);
    if (costPrice === null) {
      setError("Enter a valid cost price (0 or more).");
      return;
    }

    const sellingPrice = parseNonNegativeNumber(form.sellingPrice);
    if (sellingPrice === null || sellingPrice <= 0) {
      setError("Enter a valid selling price.");
      return;
    }

    const minimumStock = parseNonNegativeNumber(form.minimumStock);
    if (minimumStock === null) {
      setError("Enter a valid minimum stock (0 or more).");
      return;
    }

    let stock = 0;
    if (!product) {
      const parsedStock = parseNonNegativeNumber(form.stock);
      if (parsedStock === null) {
        setError("Enter a valid initial stock (0 or more).");
        return;
      }
      stock = parsedStock;
    }

    setSubmitting(true);
    try {
      const taken = await isSkuTaken(trimmedSku, product?.id);
      if (taken) {
        setError("A product with this SKU already exists.");
        return;
      }

      const payload = {
        name: trimmedName,
        sku: trimmedSku,
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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" form="product-form" disabled={submitting}>
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
              "Save Product"
            )}
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
          {!product ? (
            <Input
              id="product-stock"
              label="Initial Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
            />
          ) : (
            <p className="flex items-end pb-2.5 text-[11px] leading-snug text-text-muted">
              Stock is adjusted from the Inventory screen.
            </p>
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

        {canShowMargin && (
          <p
            className={`-mt-2 text-[12px] ${
              marginAmount < 0 ? "text-danger" : "text-text-muted"
            }`}
          >
            Margin:{" "}
            <span className="font-medium tabular-nums">
              {formatCurrency(marginAmount)}
            </span>
            {marginPercent !== null && (
              <span className="tabular-nums"> ({marginPercent.toFixed(1)}%)</span>
            )}
            {marginAmount < 0 && " — selling below cost"}
          </p>
        )}

        <label className="flex items-center gap-2 text-[13px] text-text-primary">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 rounded border-border accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
          />
          Active (visible for sale)
        </label>

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