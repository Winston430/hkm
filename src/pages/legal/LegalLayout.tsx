import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-[13px] font-semibold text-text-primary">
          Stationery Manager
        </Link>

        <div className="mt-6 rounded-lg border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-[22px] font-semibold text-text-primary">{title}</h1>
          <p className="mt-1 text-[12px] text-text-muted">Last updated: {updated}</p>

          <div className="prose-legal mt-6 flex flex-col gap-4 text-[13px] leading-6 text-text-secondary">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
