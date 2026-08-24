import { useEffect, useState, type FormEvent } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { Product } from "../../types/product";
import type { StockMovementReason } from "../../types/sale";

type Direction = "in" | "out";
type AdjustReason = Exclude<StockMovementReason, "sale">;

const reasonLabels: Record<AdjustReason, string> = {
  restock: "Restock",
  adjustment: "Manual Adjustment",
  damaged: "Damaged / Written Off",
  return: "Customer Return",
};

// Which reasons make sense for each direction — keeps the audit log
// internally consistent (e.g. "Stock In" can never be logged as "Damaged").
const reasonsByDirection: Record<Direction, AdjustReason[]> = {
  in: ["restock", "return", "adjustment"],
  out: ["damaged", "adjustment"],
};

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
  const [reason, setReason] = useState<AdjustReason>("restock");
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

  function handleDirectionChange(next: Direction) {
    setDirection(next);
    setError(null);
    // Keep the current reason if it's still valid for the new direction,
    // otherwise fall back to that direction's first option.
    if (!reasonsByDirection[next].includes(reason)) {
      setReason(reasonsByDirection[next][0]);
    }
  }

  const parsedQuantity = Number(quantity);
  const hasValidQuantity = quantity.trim() !== "" && Number.isFinite(parsedQuantity) && parsedQuantity > 0;
  const previewStock = product
    ? direction === "in"
      ? product.stock + (hasValidQuantity ? parsedQuantity : 0)
      : product.stock - (hasValidQuantity ? parsedQuantity : 0)
    : null;
  const previewGoesNegative = previewStock !== null && previewStock < 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!hasValidQuantity) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    if (direction === "out" && product && parsedQuantity > product.stock) {
      setError(`Cannot remove more than the current stock (${product.stock} available).`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        change: direction === "in" ? parsedQuantity : -parsedQuantity,
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
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" form="adjust-stock-form" disabled={submitting}>
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
              "Save Adjustment"
            )}
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
            onClick={() => handleDirectionChange("in")}
            className={`rounded-md border px-3 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 ${
              direction === "in"
                ? "border-success bg-success-light text-success"
                : "border-border text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Stock In
          </button>
          <button
            type="button"
            onClick={() => handleDirectionChange("out")}
            className={`rounded-md border px-3 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 ${
              direction === "out"
                ? "border-danger bg-danger-light text-danger"
                : "border-border text-text-secondary hover:bg-surface-secondary"
            }`}
          >
            Stock Out
          </button>
        </div>

        <div>
          <Input
            id="adjust-quantity"
            label="Quantity"
            type="number"
            min="1"
            step={1}
            inputMode="numeric"
            autoFocus
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
          />
          {hasValidQuantity && (
            <p
              className={`mt-1.5 text-[12px] tabular-nums ${
                previewGoesNegative ? "text-danger" : "text-text-muted"
              }`}
            >
              New stock will be: <span className="font-medium">{previewStock}</span>
              {previewGoesNegative && " — exceeds available stock"}
            </p>
          )}
        </div>

        <Select
          id="adjust-reason"
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value as AdjustReason)}
        >
          {reasonsByDirection[direction].map((value) => (
            <option key={value} value={value}>
              {reasonLabels[value]}
            </option>
          ))}
        </Select>

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