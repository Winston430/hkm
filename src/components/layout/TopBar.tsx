// components/layout/TopBar.tsx
import { List } from "@phosphor-icons/react";
import { UserMenu } from "./UserMenu";
import { usePageHeaderContext } from "../../context/PageHeaderContext";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { header } = usePageHeaderContext();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 hover:bg-surface-secondary lg:hidden"
      >
        <List size={19} />
      </button>

      <div key={header?.title ?? "untitled"} className="fade-in min-w-0 flex-1">
        {header?.title && (
          <div className="flex items-baseline gap-2 truncate">
            <span className="truncate text-[13.5px] font-semibold text-text-primary">
              {header.title}
            </span>
            {header.description && (
              <span className="hidden shrink-0 truncate text-[12px] text-text-muted sm:inline">
                · {header.description}
              </span>
            )}
          </div>
        )}
      </div>

      <UserMenu />
    </header>
  );
}