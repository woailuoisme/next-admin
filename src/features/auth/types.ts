import type { z } from "zod";

import type { AdminUser } from "@/features/admin-users";

import type { loginSchema } from "./schemas";

export type LoginCredentials = z.infer<typeof loginSchema>;

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
