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
import { useAuth } from "../../hooks/useAuth";
import {
  createUser,
  listUsers,
  updateUserRole,
  updateUserStatus,
} from "../../services/users";
import type { AppUser, UserRole } from "../../types/user";
import { UserFormModal } from "./UserFormModal";

type Status = "loading" | "success" | "error";

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

  async function handleCreate(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    await createUser(input);
    await load();
  }

  async function handleRoleChange(user: AppUser, role: UserRole) {
    await updateUserRole(user.id, role);
    await load();
  }

  async function handleStatusChange(user: AppUser, active: boolean) {
    await updateUserStatus(user.id, active ? "active" : "inactive");
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage admin and salesperson accounts"
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
                return (
                  <Tr key={user.id}>
                    <Td className="font-medium">{user.name}</Td>
                    <Td className="text-text-secondary">{user.email}</Td>
                    <Td>
                      <Badge variant="neutral">
                        {user.role === "admin" ? "Admin" : "Salesperson"}
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
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-md text-text-secondary ${
                              isSelf ? "opacity-40" : "hover:bg-surface-secondary"
                            }`}
                          >
                            <DotsThreeVertical size={16} weight="bold" />
                          </span>
                        }
                      >
                        {isSelf ? (
                          <div className="px-3 py-2 text-[12px] text-text-muted">
                            You can't change your own access.
                          </div>
                        ) : (
                          <>
                            <DropdownItem
                              onClick={() =>
                                handleRoleChange(
                                  user,
                                  user.role === "admin" ? "salesperson" : "admin",
                                )
                              }
                            >
                              {user.role === "admin"
                                ? "Make Salesperson"
                                : "Make Admin"}
                            </DropdownItem>
                            <DropdownItem
                              onClick={() =>
                                handleStatusChange(user, user.status !== "active")
                              }
                            >
                              {user.status === "active" ? "Deactivate" : "Activate"}
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
        )}
      </Card>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
