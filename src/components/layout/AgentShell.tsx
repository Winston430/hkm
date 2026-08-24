import type { ReactNode } from "react";
import { UserMenu } from "./UserMenu";
import { Footer } from "./Footer";

export function AgentShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 lg:px-6">
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">
          Stationery Manager
        </span>
        <UserMenu />
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}