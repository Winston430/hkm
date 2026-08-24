// pages/NotFound.tsx
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, House } from "@phosphor-icons/react";
import { Footer } from "../components/layout/Footer";
import { useAuth } from "../hooks/useAuth";

export function NotFound() {
  const navigate = useNavigate();
  const { status, profile } = useAuth();

  useEffect(() => {
    document.title = "Page Not Found | Stationery Manager";
  }, []);

  const homeHref =
    status === "authenticated"
      ? profile?.role === "agent"
        ? "/agent"
        : "/admin/dashboard"
      : "/login";
  const homeLabel = status === "authenticated" ? "Go to Dashboard" : "Go to Sign In";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-orange">
          Error
        </p>
        <p className="mt-2 text-[64px] font-semibold leading-none tabular-nums tracking-tight text-text-primary">
          404
        </p>
        <h1 className="mt-4 text-[17px] font-semibold tracking-tight text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-text-secondary">
          The page you're looking for doesn't exist, may have moved, or the
          link might be out of date.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
          >
            <ArrowLeft size={15} />
            Go back
          </button>
          <Link
            to={homeHref}
            className="inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-black-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 focus-visible:ring-offset-1"
          >
            <House size={15} />
            {homeLabel}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}