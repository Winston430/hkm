// pages/users/Users.tsx
import { useEffect, useState } from "react";
import { DotsThreeVertical, Plus, Users as UsersIcon } from "@phosphor-icons/react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Table, TableHead, Th, Td, Tr } from "../../components/ui/Table";
import { Dropdown, DropdownItem } from "../../components/ui/Dropdown";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import {
  createUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../../services/users";
import type { AppUser, UserRole } from "../../types/user";
import { toast } from "../../lib/toast";
import { UserFormModal } from "./UserFormModal";

type Status = "loading" | "success" | "error";
const FLASH_DURATION_MS = 900; // matches .row-flash animation length in index.css

function formatLastActivity(ms: number | null) {
  if (!ms) return "Never";
  const days = Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function Users() {
  const { profile } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [confirmingPromote, setConfirmingPromote] = useState<AppUser | null>(null);

  async function load() {
    setStatus("loading");
    try {
      const data = await listUsers();
      setUsers(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), FLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  async function handleCreate(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const created = await createUser(input);
    setUsers((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setFlashId(created.id);
    toast.success("User created successfully.");
  }

  async function handleRoleChange(user: AppUser, role: UserRole) {
    setPendingUserId(user.id);
    try {
      const { updatedAt } = await updateUserRole(user.id, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role, updatedAt } : u)),
      );
      setFlashId(user.id);
      toast.success(`${user.name} is now ${role === "admin" ? "an admin" : "an agent"}.`);
    } catch {
      toast.error(`Unable to update ${user.name}'s role. Please try again.`);
    } finally {
      setPendingUserId(null);
    }
  }

  // Demoting to agent is low-stakes and fires immediately; promoting to
  // admin grants elevated access, so that path is gated behind a confirm.
  function requestRoleChange(user: AppUser) {
    const nextRole: UserRole = user.role === "admin" ? "agent" : "admin";
    if (nextRole === "admin") {
      setConfirmingPromote(user);
    } else {
      void handleRoleChange(user, nextRole);
    }
  }

  async function handleStatusChange(user: AppUser, active: boolean) {
    setPendingUserId(user.id);
    try {
      const nextStatus = active ? "active" : "inactive";
      const { updatedAt } = await updateUserStatus(user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus, updatedAt } : u)),
      );
      setFlashId(user.id);
      toast.success(`${user.name} ${active ? "activated" : "deactivated"}.`);
    } catch {
      toast.error(`Unable to update ${user.name}'s status. Please try again.`);
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage admin and agent accounts"
        action={
          <Button icon={<Plus size={15} />} onClick={() => setFormOpen(true)}>
            Add User
          </Button>
        }
      />

      <Card padded={false} className="p-5">
        {status === "loading" && (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} columns={5} />
            ))}
          </div>
        )}

        {status === "error" && <ErrorState onRetry={load} />}

        {status === "success" && users.length === 0 && (
          <EmptyState
            icon={<UsersIcon size={22} />}
            title="No users yet"
            description="Add your team so they can sign in to the admin app."
            action={
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setFormOpen(true)}>
                Add User
              </Button>
            }
          />
        )}

        {status === "success" && users.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last Activity</Th>
                <Th>Actions</Th>
              </TableHead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === profile?.id;
                  const isPending = pendingUserId === user.id;
                  return (
                    <Tr
                      key={user.id}
                      className={user.id === flashId ? "row-flash" : undefined}
                    >
                      <Td className="font-medium">{user.name}</Td>
                      <Td className="text-text-secondary">{user.email}</Td>
                      <Td>
                        <Badge variant={user.role === "admin" ? "orange" : "neutral"}>
                          {user.role === "admin" ? "Admin" : "Agent"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge variant="neutral">
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td className="text-text-secondary">
                        {formatLastActivity(user.lastActivityAt)}
                      </Td>
                      <Td>
                        <Dropdown
                          trigger={
                            <button
                              type="button"
                              aria-label={
                                isSelf
                                  ? "Your account — actions restricted"
                                  : `Actions for ${user.name}`
                              }
                              aria-haspopup="menu"
                              className={`flex h-7 w-7 items-center justify-center rounded-md text-text-secondary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 ${
                                isSelf ? "opacity-40" : "hover:bg-surface-secondary"
                              }`}
                            >
                              <DotsThreeVertical size={16} weight="bold" />
                            </button>
                          }
                        >
                          {isSelf ? (
                            <div className="px-3 py-2 text-[12px] text-text-muted">
                              You can't change your own access.
                            </div>
                          ) : (
                            <>
                              <DropdownItem
                                disabled={isPending}
                                onClick={() => requestRoleChange(user)}
                              >
                                {isPending
                                  ? "Updating…"
                                  : user.role === "admin"
                                    ? "Make Agent"
                                    : "Make Admin"}
                              </DropdownItem>
                              <DropdownItem
                                disabled={isPending}
                                onClick={() =>
                                  handleStatusChange(user, user.status !== "active")
                                }
                              >
                                {isPending
                                  ? "Updating…"
                                  : user.status === "active"
                                    ? "Deactivate"
                                    : "Activate"}
                              </DropdownItem>
                            </>
                          )}
                        </Dropdown>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} />

      <ConfirmDialog
        open={confirmingPromote !== null}
        onClose={() => setConfirmingPromote(null)}
        onConfirm={async () => {
          if (!confirmingPromote) return;
          await handleRoleChange(confirmingPromote, "admin");
          setConfirmingPromote(null);
        }}
        title="Grant admin access"
        description={`Make ${confirmingPromote?.name} an admin? They'll get full access to products, sales, users, and settings.`}
        confirmLabel="Make Admin"
        danger
        submitting={pendingUserId === confirmingPromote?.id}
      />
    </div>
  );
}