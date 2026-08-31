// components/auth/RequirePermission.tsx — new file
import type { ReactNode } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";
import type { Permission } from "../../types/permissions";

export function RequirePermission({
  anyOf,
  children,
}: {
  anyOf: Permission[];
  children: ReactNode;
}) {
  const { hasAnyPermission } = useAuth();

  if (!hasAnyPermission(anyOf)) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <WarningCircle size={24} className="text-danger" />
        <p className="text-[15px] font-semibold text-text-primary">Access restricted</p>
        <p className="max-w-sm text-[13px] text-text-secondary">
          You don't have permission to view this page. Contact an administrator if you need access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}