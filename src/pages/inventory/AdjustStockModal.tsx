import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { Product } from "../../types/product";
import type { StockMovementReason } from "../../types/sale";

const reasonLabels: Record<Exclude<StockMovementReason, "sale">, string> = {
  restock: "Restock",
  adjustment: "Manual Adjustment",
  damaged: "Damaged / Written Off",
  return: "Customer Return",
};

type Direction = "in" | "out";

export function AdjustStockModal({
  open,
  onClose,
  product,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (params: {
    change: number;
    reason: StockMovementReason;
  }) => Promise<void>;
}) {
  const [direction, setDirection] = useState<Direction>("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<StockMovementReason>("restock");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDirection("in");
      setQuantity("");
      setReason("restock");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = Number(quantity);
    if (!amount || amount <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        change: direction === "in" ? amount : -amount,
        reason,
      });
      onClose();
    } catch {
      setError("Unable to update stock. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      width="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" type="submit" form="adjust-stock-form" disabled={submitting}>
            {submitting ? "Saving..." : "Save Adjustment"}
          </Button>
        </>
      }
    >
      <form id="adjust-stock-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-medium text-text-primary">{product.name}</p>
          <p className="text-[12px] text-text-muted">
            Current stock: {product.stock} units
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setDirection("in")}
            className={`rounded-md border px-3 py-2 text-[13px] font-medium ${
              direction === "in"
                ? "border-black bg-black text-white"
                : "border-border text-text-secondary"
            }`}
          >
            Stock In
          </button>
          <button
            type="button"
            onClick={() => setDirection("out")}
            className={`rounded-md border px-3 py-2 text-[13px] font-medium ${
              direction === "out"
                ? "border-black bg-black text-white"
                : "border-border text-text-secondary"
            }`}
          >
            Stock Out
          </button>
        </div>

        <Input
          id="adjust-quantity"
          label="Quantity"
          type="number"
          min="1"
          autoFocus
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <Select
          id="adjust-reason"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as StockMovementReason)}
        >
          {Object.entries(reasonLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        {error && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
