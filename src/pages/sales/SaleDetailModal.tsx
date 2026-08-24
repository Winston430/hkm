// pages/sales/SaleDetailModal.tsx
import { useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatCurrency } from "../../lib/format";
import type { Sale, SaleStatus } from "../../types/sale";

const statusVariant: Record<SaleStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  refunded: "warning",
  cancelled: "danger",
};

const paymentLabel: Record<Sale["paymentMethod"], string> = {
  cash: "Cash",
  card: "Card",
  "mobile-money": "Mobile Money",
};

export function SaleDetailModal({
  sale,
  onClose,
  onRefund,
}: {
  sale: Sale | null;
  onClose: () => void;
  onRefund: (sale: Sale) => Promise<void>;
}) {
  const [confirmingRefund, setConfirmingRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sale) return null;

  async function handleRefund() {
    if (!sale) return;
    setRefunding(true);
    setError(null);
    try {
      await onRefund(sale);
      setConfirmingRefund(false);
      onClose();
    } catch {
      setError("Unable to process refund. Please try again.");
      setConfirmingRefund(false);
    } finally {
      setRefunding(false);
    }
  }

  return (
    <>
      <Modal
        open={sale !== null}
        onClose={onClose}
        title={sale.invoiceNumber}
        width="md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={refunding}
            >
              Close
            </Button>
            {sale.status === "completed" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmingRefund(true)}
                disabled={refunding}
              >
                Refund Sale
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase text-text-muted">Agent</p>
              <p className="mt-0.5 text-text-primary">{sale.agentName}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">Payment</p>
              <p className="mt-0.5 text-text-primary">
                {paymentLabel[sale.paymentMethod]}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">Status</p>
              <Badge variant={statusVariant[sale.status]}>
                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border-light">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border-light bg-surface-secondary">
                    <th className="px-3 py-2 font-medium text-text-muted">Item</th>
                    <th className="px-3 py-2 text-right font-medium text-text-muted">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-text-muted">
                      Unit Price
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-text-muted">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, i) => (
                    <tr key={i} className="border-b border-border-light last:border-b-0">
                      <td className="px-3 py-2">{item.productName}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-light pt-3">
            <span className="text-[13px] font-medium text-text-primary">Total</span>
            <span className="text-[16px] font-semibold tabular-nums text-text-primary">
              {formatCurrency(sale.totalAmount)}
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
            >
              <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmingRefund}
        onClose={() => setConfirmingRefund(false)}
        onConfirm={handleRefund}
        title="Refund sale"
        description={`Refund ${sale.invoiceNumber} for ${formatCurrency(sale.totalAmount)}? This can't be undone.`}
        confirmLabel="Refund"
        danger
        submitting={refunding}
      />
    </>
  );
}