import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}