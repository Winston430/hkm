import { Link } from "react-router-dom";
import { FileText, Shield, WarningCircle } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Skeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../hooks/useAuth";
import { BusinessProfileForm } from "./BusinessProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const legalLinkClass =
  "flex w-fit items-center gap-2 rounded-sm text-[13px] text-text-primary transition-colors duration-150 hover:text-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 focus-visible:ring-offset-1";

export function Settings() {
  const { status, profile, error } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and business details" />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Account" />

          {status === "loading" && (
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-10" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-10" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </div>
          )}

          {status === "authenticated" && !profile && (
            <p
              role="alert"
              className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
            >
              <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
              {error ?? "Unable to load your account details. Try reloading the page."}
            </p>
          )}

          {status === "authenticated" && profile && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-[13px] font-semibold text-white">
                {getInitials(profile.name)}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-muted">
                  Name
                </p>
                <p className="mt-0.5 text-[13px] text-text-primary">{profile.name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-muted">
                  Email
                </p>
                <p className="mt-0.5 text-[13px] text-text-primary">{profile.email}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-text-muted">
                  Role
                </p>
                <Badge variant={profile.role === "admin" ? "orange" : "neutral"}>
                  {profile.role === "admin" ? "Admin" : "Agent"}
                </Badge>
              </div>
            </div>
          )}
        </Card>

        <ChangePasswordForm />
        <BusinessProfileForm />

        <Card>
          <CardHeader title="Legal" />
          <div className="flex flex-col gap-2">
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={legalLinkClass}
            >
              <Shield size={15} className="text-text-muted" />
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className={legalLinkClass}
            >
              <FileText size={15} className="text-text-muted" />
              Terms of Service
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}