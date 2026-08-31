import type { Permission } from "./permissions";

export type UserRole = "admin" | "agent";

export type UserStatus = "active" | "inactive";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  lastActivityAt: number | null;
  createdAt: number;
  updatedAt: number;
}