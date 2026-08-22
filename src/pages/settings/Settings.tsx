import { Link } from "react-router-dom";
import { FileText, Shield } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { BusinessProfileForm } from "./BusinessProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function Settings() {
  const { profile } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and business details" />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="Account" />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]">
            <div>
              <p className="text-[11px] uppercase text-text-muted">Name</p>
              <p className="mt-0.5 text-text-primary">{profile?.name}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">Email</p>
              <p className="mt-0.5 text-text-primary">{profile?.email}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase text-text-muted">Role</p>
              <Badge variant="neutral">
                {profile?.role === "admin" ? "Admin" : "Salesperson"}
              </Badge>
            </div>
          </div>
        </Card>

        <ChangePasswordForm />
        <BusinessProfileForm />

        <Card>
          <CardHeader title="Legal" />
          <div className="flex flex-col gap-2">
            <Link
              to="/privacy"
              target="_blank"
              className="flex items-center gap-2 text-[13px] text-text-primary hover:underline"
            >
              <Shield size={15} className="text-text-muted" />
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              target="_blank"
              className="flex items-center gap-2 text-[13px] text-text-primary hover:underline"
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
