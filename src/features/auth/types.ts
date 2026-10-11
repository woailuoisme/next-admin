import type { z } from "zod";

import type { loginSchema } from "./schemas";

export type LoginCredentials = z.infer<typeof loginSchema>;

export type AdminRole = "superadmin" | "admin" | "manager" | "auditor" | "operator" | "viewer";
export type AdminUserStatus = "active" | "inactive" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: AdminRole;
  status: AdminUserStatus;
  createdAt: string;
  lastActiveAt: string;
}

export interface AuthSession {
  token: string;
  admin: AdminUser;
}

export interface AuthState {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DemoAccount {
  name: string;
  email: string;
  role: string;
}
