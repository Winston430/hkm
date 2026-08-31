// pages/legal/LegalLayout.tsx
import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";

interface LegalLayoutProps {
  title: string;
  /** ISO date string, e.g. "2026-08-24" — rendered inside a <time> element. */
  updated: string;
  description?: string;
  children: ReactNode;
}

/** Wraps legal pages in a single <article> with one <h1> and
 *  <section>/<h2> children — the structure Firefox's and Safari's
 *  reader-mode parsers look for when triggered on a live, rendered page. */
export function LegalLayout({ title, updated, description, children }: LegalLayoutProps) {
  useEffect(() => {
    document.title = `${title} | Hekima Veritas`;

    if (!description) return;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute("content");
    meta.setAttribute("content", description);
    return () => {
      if (previous !== null) meta!.setAttribute("content", previous);
    };
  }, [title, description]);

  const formattedDate = new Date(updated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 rounded-sm text-[12px] text-text-muted transition-colors duration-150 hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
        >
          <ArrowLeft size={13} />
          Back
        </Link>

        <article>
          <header className="mb-8 border-b border-border-light pb-6">
            <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="mt-1.5 text-[12.5px] text-text-muted">
              Last updated: <time dateTime={updated}>{formattedDate}</time>
            </p>
          </header>

          <div className="flex flex-col gap-7 text-[13.5px] leading-relaxed text-text-secondary">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}