export type UserRole = "admin" | "agent";

export type UserStatus = "active" | "inactive";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActivityAt: number | null;
  createdAt: number;
  updatedAt: number;
}
