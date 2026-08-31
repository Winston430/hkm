import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { logout } from "../services/auth";
import type { UserRole } from "../types/user";

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

const roleLabel: Record<UserRole, string> = {
  admin: "administrators",
  agent: "agents",
};

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles: UserRole[];
}) {
  const { status, profile, error, isResolvingProfile } = useAuth();

  // Must come before the `!profile` check below — status flips to
  // "authenticated" as soon as sign-in is confirmed, but the profile
  // (and therefore the role) can still be loading or retrying for a
  // few hundred ms after that. Checking !profile first was the bug:
  // it read "not loaded yet" as "failed to load."
  if (status === "loading" || isResolvingProfile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="spinner spinner-lg" role="status" aria-label="Loading" />
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

  if (!roles.includes(profile.role)) {
    return (
      <AccessScreen
        title="Access restricted"
        description={`This area is only available to ${roles
          .map((role) => roleLabel[role])
          .join(" and ")}.`}
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