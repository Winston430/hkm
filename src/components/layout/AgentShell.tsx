// components/layout/AgentShell.tsx — full file
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { UserMenu } from "./UserMenu";
import { Footer } from "./Footer";
import { useAuth } from "../../hooks/useAuth";
import { agentNavItems } from "./agentNavItems";

export function AgentShell({ children }: { children: ReactNode }) {
  const { hasPermission } = useAuth();

  const visibleItems = agentNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  );
  const showNav = visibleItems.length > 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="grid h-14 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border bg-surface px-4 lg:px-6">
        <img
          src="/logo-wordmark.png"
          alt="Stationery Manager"
          className="h-12 w-auto max-w-[130px] shrink-0 object-contain"
        />

        {showNav ? (
          <nav className="nav-scroll flex items-center justify-center gap-1 overflow-x-auto">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-medium",
                    "transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35",
                    isActive
                      ? "bg-orange-light text-orange-dark"
                      : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                  ].join(" ")
                }
              >
                <item.icon size={15} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        ) : (
          <div />
        )}

        <div className="flex shrink-0 items-center justify-self-end gap-3">
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}