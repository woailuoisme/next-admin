// Public API seam for auth feature

export {
  changePasswordApi,
  fetchCurrentAdminApi,
  forgotPasswordApi,
  loginApi,
  logoutApi,
  resetPasswordApi,
  updateProfileApi,
  verifyOtpApi,
} from "./api";
export { AuthAppBridge } from "./components/AuthAppBridge";
export { AuthCard, AuthShell } from "./components/AuthShell";
export { ProfileSkeleton } from "./components/profile/ProfileSkeleton";
export { SessionValidator } from "./components/SessionValidator";
export { ForgotPasswordForm } from "./components/ForgotPasswordForm";
export { LoginForm } from "./components/LoginForm";
export { ResetPasswordForm } from "./components/ResetPasswordForm";
export { VerifyOtpForm } from "./components/VerifyOtpForm";
export {
  resolveResetErrorKey,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useSessionValidation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from "./hooks";
export { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
export { LoginPage } from "./pages/LoginPage";
export { ProfilePage } from "./pages/ProfilePage";
export { ResetPasswordPage } from "./pages/ResetPasswordPage";
export { VerifyOtpPage } from "./pages/VerifyOtpPage";
export {
  clearResetFlow,
  hasStoredResetFlow,
  hasUsableResetToken,
  patchResetFlow,
  peekResetFlow,
  readResetFlow,
  saveResetFlow,
} from "./resetFlow";
export {
  buildChangePasswordSchema,
  buildProfileSchema,
  buildResetPasswordSchema,
  forgotPasswordSchema,
  isStrongEnough,
  loginSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "./schemas";
export {
  type AuthStore,
  AUTH_COOKIE_NAME,
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
  ChangePasswordPayload,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
  LoginCredentials,
  ResetFlowErrorCode,
  ResetPasswordCredentials,
  UpdateProfilePayload,
  VerifyOtpCredentials,
  VerifyOtpResponse,
} from "./types";
