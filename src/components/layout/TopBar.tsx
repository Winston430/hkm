import { List } from "@phosphor-icons/react";
import { UserMenu } from "./UserMenu";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:bg-surface-secondary lg:hidden"
      >
        <List size={19} />
      </button>

      <div className="hidden lg:block" />

      <UserMenu />
    </header>
  );
}
