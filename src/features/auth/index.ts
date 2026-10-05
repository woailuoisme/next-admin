// Public API seam for auth feature

export { getDemoAccountsApi, loginApi, logoutApi } from "./api";
export { LoginForm } from "./components/LoginForm";
export { useDemoAccountsQuery, useLoginMutation, useLogoutMutation } from "./hooks";
export { LoginPage } from "./pages/LoginPage";
export { authKeys, authQueries } from "./queries";
export { loginSchema } from "./schemas";
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
export type { AuthSession, AuthState, DemoAccount, LoginCredentials } from "./types";
