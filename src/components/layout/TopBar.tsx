import { CaretDown, List, SignOut } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownItem } from "../ui/Dropdown";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/auth";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { profile, firebaseUser } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.name ?? firebaseUser?.email ?? "Account";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

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

      <Dropdown
        trigger={
          <span className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-surface-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-[11px] font-semibold text-white">
              {initials(displayName)}
            </span>
            <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-text-primary sm:block">
              {displayName}
            </span>
            <CaretDown size={13} className="hidden text-text-muted sm:block" />
          </span>
        }
      >
        <div className="border-b border-border-light px-3 py-2">
          <p className="truncate text-[13px] font-medium text-text-primary">
            {displayName}
          </p>
          {profile?.role && (
            <p className="text-[11px] capitalize text-text-muted">
              {profile.role}
            </p>
          )}
        </div>
        <DropdownItem onClick={handleLogout} danger>
          <SignOut size={15} />
          Log out
        </DropdownItem>
      </Dropdown>
    </header>
  );
}
