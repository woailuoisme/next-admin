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

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ForgotPasswordResponse {
  ticket: string;
  /** 票据有效期（秒） */
  expiresIn: number;
  /** 仅非生产环境返回，便于演示 */
  devCode?: string;
}

export interface VerifyOtpCredentials {
  ticket: string;
  code: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  /** 重置令牌有效期（秒） */
  expiresIn: number;
}

export interface ResetPasswordCredentials {
  resetToken: string;
  password: string;
}

/** 重置流程中后端可能返回的业务错误码 */
export type ResetFlowErrorCode =
  | "INVALID_CODE"
  | "TICKET_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "RESEND_TOO_SOON"
  | "WEAK_PASSWORD";
