// components/layout/SidebarContent.tsx — full file
import { Gear } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { primaryNavItems } from "./navItems";
import { useAuth } from "../../hooks/useAuth";

interface NavItemProps {
  to: string;
  label: string;
  icon: Icon;
  end?: boolean;
  collapsed?: boolean;
}

function NavItem({ to, label, icon: ItemIcon, end, collapsed = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group relative flex min-w-0 items-center rounded-md text-[13px] font-medium",
          collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-3 py-2",
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
          <span className="flex shrink-0 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-[1.15]">
            <ItemIcon size={17} weight={isActive ? "fill" : "regular"} />
          </span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export function SidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const { isAdmin, hasPermission } = useAuth();

  const visibleItems = primaryNavItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.permission) return hasPermission(item.permission);
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center justify-center px-3">
        {collapsed ? (
          <img
            src="/icon-v.png" // ← swap for the real asset path
            alt="Stationery Manager"
            className="h-9 w-9 object-contain"
          />
        ) : (
          <img
            src="/logo-wordmark.png" // ← swap for the real asset path
            alt="Stationery Manager"
            className="h-12 w-auto max-w-[180px] object-contain"
          />
        )}
      </div>

      <nav className="sidebar-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-3 py-2">
        {visibleItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {isAdmin && (
        <div className="border-t border-border-light px-3 py-3">
          <NavItem to="/admin/settings" label="Settings" icon={Gear} collapsed={collapsed} />
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <aside
      className={`hidden shrink-0 overflow-hidden border-r border-border bg-surface transition-[width] duration-200 ease-out lg:block ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}