// pages/users/PermissionsModal.tsx — new file, for editing an existing user's grants
import { useEffect, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { PERMISSION_GROUPS, type Permission } from "../../types/permissions";
import type { AppUser } from "../../types/user";

export function PermissionsModal({
  user,
  onClose,
  onSubmit,
}: {
  user: AppUser | null;
  onClose: () => void;
  onSubmit: (userId: string, permissions: Permission[]) => Promise<void>;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPermissions(user.permissions ?? []);
      setError(null);
    }
  }, [user]);

  if (!user) return null;

  function togglePermission(permission: Permission) {
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    );
  }

  async function handleSave() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(user!.id, permissions);
      onClose();
    } catch {
      setError("Unable to save permissions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={user !== null}
      onClose={onClose}
      title={`Permissions — ${user.name}`}
      width="md"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="spinner-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                Saving
              </span>
            ) : (
              "Save Permissions"
            )}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {PERMISSION_GROUPS.map((group) => (
          <div key={group.resource}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-text-muted">
              {group.label}
            </p>
            <div className="flex flex-col gap-1.5">
              {group.permissions.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 text-[13px] text-text-primary">
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.key)}
                    disabled={submitting}
                    onChange={() => togglePermission(perm.key)}
                    className="h-4 w-4 rounded border-border accent-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35"
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-1.5 rounded-md bg-danger-light px-3 py-2 text-[12px] text-danger"
          >
            <WarningCircle size={14} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}