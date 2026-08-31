import { X } from "@phosphor-icons/react";
import { SidebarContent } from "./Sidebar";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </div>
    </div>
  );
}
