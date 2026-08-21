import { Gear } from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { primaryNavItems } from "./navItems";

export function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          Stationery Manager
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {primaryNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium ${
                isActive
                  ? "bg-orange-light text-orange-dark"
                  : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
              }`
            }
          >
            <item.icon size={17} weight="regular" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-light px-3 py-3">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium ${
              isActive
                ? "bg-orange-light text-orange-dark"
                : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            }`
          }
        >
          <Gear size={17} weight="regular" />
          Settings
        </NavLink>
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
