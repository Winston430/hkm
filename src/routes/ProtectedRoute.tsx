import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { logout } from "../services/auth";

function AccessScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <WarningCircle size={24} className="text-danger" />
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      <p className="max-w-sm text-[13px] text-text-secondary">{description}</p>
      <Button variant="secondary" size="sm" className="mt-2" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, profile, error } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-black" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <AccessScreen
        title="Unable to load your account"
        description={
          error ??
          "Your account isn't set up yet. Ask an administrator to create a user profile for you."
        }
      />
    );
  }

  if (profile.role !== "admin") {
    return (
      <AccessScreen
        title="Access restricted"
        description="This area is only available to administrators."
      />
    );
  }

  if (profile.status !== "active") {
    return (
      <AccessScreen
        title="Account inactive"
        description="Your account has been deactivated. Contact an administrator for access."
      />
    );
  }

  return <>{children}</>;
}
