import { Gear } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { primaryNavItems } from "./navItems";

interface NavItemProps {
  to: string;
  label: string;
  icon: Icon;
  end?: boolean;
}

function NavItem({ to, label, icon: ItemIcon, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "group relative flex min-w-0 items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium",
          "transition-colors duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 focus-visible:ring-offset-1",
          isActive
            ? "bg-orange-light text-orange-dark"
            : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-orange transition-opacity duration-150 ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          />
          <ItemIcon size={17} weight={isActive ? "fill" : "regular"} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          Stationery Manager
        </span>
      </div>

      <nav className="sidebar-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {primaryNavItems.map((item) => (
          <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
        ))}
      </nav>

      <div className="border-t border-border-light px-3 py-3">
        <NavItem to="/admin/settings" label="Settings" icon={Gear} />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
      <SidebarContent />
    </aside>
  );
}