import { isPlainObject } from "es-toolkit";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { clearQueryCache } from "@/lib/queryClient";

import type { AuthSession, AuthState } from "./types";

export interface AuthStore extends AuthState {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

const AUTH_STORAGE_KEY = "tanstack_admin_auth_session_v1";

export const AUTH_COOKIE_NAME = "auth_token";

export function syncAuthCookie(token: string | null): void {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const str = window.localStorage.getItem(name);
    if (!str) {
      return null;
    }
    try {
      const parsed = JSON.parse(str);
      // Already in Zustand persist format
      if (isPlainObject(parsed) && "state" in parsed) {
        return str;
      }
      // Legacy raw AuthSession format { token, admin }
      if (isPlainObject(parsed) && "token" in parsed) {
        const session = parsed as AuthSession;
        return JSON.stringify({
          state: {
            session,
            isAuthenticated: Boolean(session.token),
          },
          version: 0,
        });
      }
    } catch (e) {
      console.error("Failed to parse auth storage session", e);
    }
    return str;
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(name);
      syncAuthCookie(null);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      setSession: (session: AuthSession) => {
        syncAuthCookie(session?.token || null);
        set({
          session,
          isAuthenticated: Boolean(session?.token),
          isLoading: false,
        });
      },
      clearSession: () => {
        syncAuthCookie(null);
        // 联合消杀：排空 IndexedDB 缓存与运行时内存
        clearQueryCache().catch((err) => {
          console.warn("[Auth] Failed to clear query cache during logout:", err);
        });
        set({
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => customStorage),
      skipHydration: true,
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncAuthCookie(state.session?.token ?? null);
        state.setHasHydrated(true);
      },
    },
  ),
);

/** 订阅跨标签页（Multi-tab）auth 存储同步事件，并返回清理函数 */
export function subscribeAuthStorageSync(): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_STORAGE_KEY) return;
    if (!event.newValue) {
      // 其他标签页执行了退出登录
      useAuthStore.getState().clearSession();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return;
    }
    // 其他标签页更新了登录态
    try {
      const parsed = JSON.parse(event.newValue);
      const session = parsed?.state?.session ?? null;
      syncAuthCookie(session?.token ?? null);
      useAuthStore.setState({
        session,
        isAuthenticated: Boolean(session?.token),
        isLoading: false,
      });
    } catch (e) {
      console.error("[Auth] Failed to parse cross-tab auth sync event", e);
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
  };
}

// Imperative helpers for non-React callers (e.g. apiClient)
export function setAuthSession(session: AuthSession): void {
  useAuthStore.getState().setSession(session);
}

export function clearAuthSession(): void {
  useAuthStore.getState().clearSession();
}

export function getAuthToken(): string | null {
  return useAuthStore.getState().session?.token ?? null;
}

// Fine-grained selector hooks to prevent unnecessary re-renders
export const useAuthSession = () => useAuthStore((s) => s.session);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthAdmin = () => useAuthStore((s) => s.session?.admin ?? null);
export const useAuthRole = () => useAuthStore((s) => s.session?.admin?.role);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);
