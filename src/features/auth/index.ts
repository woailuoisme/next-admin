// Public API seam for auth feature

export {
  fetchCurrentAdminApi,
  forgotPasswordApi,
  getDemoAccountsApi,
  loginApi,
  logoutApi,
  resetPasswordApi,
  verifyOtpApi,
} from "./api";
export { AuthCard, AuthShell } from "./components/AuthShell";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { LoginForm } from "./components/LoginForm";
export { ResetPasswordForm } from "./components/ResetPasswordForm";
export { VerifyOtpForm } from "./components/VerifyOtpForm";
export {
  resolveResetErrorKey,
  useDemoAccountsQuery,
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useVerifyOtpMutation,
} from "./hooks";
export { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { LoginPage } from "./pages/LoginPage";
export { ResetPasswordPage } from "./pages/ResetPasswordPage";
export { VerifyOtpPage } from "./pages/VerifyOtpPage";
export { authKeys, authQueries } from "./queries";
export { clearResetFlow, hasUsableResetToken, patchResetFlow, readResetFlow, saveResetFlow } from "./resetFlow";
export {
  buildResetPasswordSchema,
  forgotPasswordSchema,
  isStrongEnough,
  loginSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./schemas";
export {
  type AuthStore,
  clearAuthSession,
  getAuthToken,
  setAuthSession,
  useAuthAdmin,
  useAuthLoading,
  useAuthRole,
  useAuthSession,
  useAuthStore,
  useIsAuthenticated,
} from "./store";
export type {
  AdminRole,
  AdminUser,
  AdminUserStatus,
  AuthSession,
  AuthState,
  DemoAccount,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
  LoginCredentials,
  ResetFlowErrorCode,
  ResetPasswordCredentials,
  VerifyOtpCredentials,
  VerifyOtpResponse,
} from "./types";
