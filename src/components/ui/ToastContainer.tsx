import { useEffect, useState } from "react";
import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { subscribeToasts, type ToastMessage } from "../../lib/toast";
import { playToastSound } from "../../lib/sound";

const DISMISS_AFTER_MS = 4500;

const iconByType = {
  success: <CheckCircle size={18} weight="fill" className="text-success" />,
  error: <XCircle size={18} weight="fill" className="text-danger" />,
  warning: <WarningCircle size={18} weight="fill" className="text-orange" />,
  info: <Info size={18} weight="fill" className="text-info" />,
} as const;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      playToastSound(toast.type);
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, DISMISS_AFTER_MS);
    });
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        >
          <span className="mt-0.5 shrink-0">{iconByType[toast.type]}</span>
          <p className="flex-1 text-[13px] text-text-primary">{toast.text}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="mt-0.5 shrink-0 text-text-muted hover:text-text-secondary"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
