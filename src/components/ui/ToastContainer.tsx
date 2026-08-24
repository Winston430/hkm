// components/ui/ToastContainer.tsx
import { useEffect, useRef, useState } from "react";
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
const EXIT_ANIMATION_MS = 180;
const MAX_VISIBLE_TOASTS = 4;

const iconByType = {
  success: <CheckCircle size={18} weight="fill" className="text-success" />,
  error: <XCircle size={18} weight="fill" className="text-danger" />,
  warning: <WarningCircle size={18} weight="fill" className="text-orange" />,
  info: <Info size={18} weight="fill" className="text-info" />,
} as const;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);

  const remainingMs = useRef(DISMISS_AFTER_MS);
  const startedAt = useRef(0);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearDismissTimer() {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }

  function startDismissTimer(ms: number) {
    clearDismissTimer();
    startedAt.current = Date.now();
    dismissTimer.current = setTimeout(beginExit, ms);
  }

  function beginExit() {
    clearDismissTimer();
    setLeaving(true);
    exitTimer.current = setTimeout(() => onDismiss(toast.id), EXIT_ANIMATION_MS);
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    startDismissTimer(DISMISS_AFTER_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearDismissTimer();
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseEnter() {
    if (leaving) return;
    setPaused(true);
    const elapsed = Date.now() - startedAt.current;
    remainingMs.current = Math.max(remainingMs.current - elapsed, 400);
    clearDismissTimer();
  }

  function handleMouseLeave() {
    if (leaving) return;
    setPaused(false);
    startDismissTimer(remainingMs.current);
  }

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-start gap-2.5 overflow-hidden rounded-lg border border-border bg-surface px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out ${
        visible && !leaving
          ? "translate-x-0 opacity-100"
          : "translate-x-3 opacity-0"
      }`}
    >
      <span className="mt-0.5 shrink-0">{iconByType[toast.type]}</span>
      <p className="flex-1 text-[13px] text-text-primary">{toast.text}</p>
      <button
        type="button"
        onClick={beginExit}
        aria-label="Dismiss"
        className="mt-0.5 shrink-0 rounded-sm text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
      >
        <X size={14} />
      </button>

      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-orange/40"
        style={{
          animation: `toast-countdown ${DISMISS_AFTER_MS}ms linear forwards`,
          animationPlayState: paused || leaving ? "paused" : "running",
        }}
      />
    </div>
  );
}

export function ToastContainer() {
  const [visible, setVisible] = useState<ToastMessage[]>([]);
  const queue = useRef<ToastMessage[]>([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      playToastSound(toast.type);
      setVisible((prev) => {
        if (prev.length < MAX_VISIBLE_TOASTS) {
          return [...prev, toast];
        }
        queue.current.push(toast);
        return prev;
      });
    });
  }, []);

  function dismiss(id: number) {
    setVisible((prev) => {
      const next = prev.filter((t) => t.id !== id);
      const fromQueue = queue.current.shift();
      return fromQueue ? [...next, fromQueue] : next;
    });
  }

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {visible.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}