import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AUTH_COOKIE_NAME,
  clearAuthSession,
  getAuthToken,
  setAuthSession,
  syncAuthCookie,
  useAuthStore,
} from "@/features/auth/store";
import type { AuthSession } from "@/features/auth/types";

describe("Auth Store & Cookie Sync Tests", () => {
  const mockSession: AuthSession = {
    token: "mock-jwt-token-xyz-123",
    admin: {
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      lastActiveAt: "2026-01-01T00:00:00.000Z",
    },
  };

  beforeEach(() => {
    // Reset cookie & store
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    useAuthStore.setState({
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  afterEach(() => {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("should sync auth cookie when syncAuthCookie is invoked", () => {
    syncAuthCookie("sample-token");
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=sample-token`);

    syncAuthCookie(null);
    expect(document.cookie).not.toContain("sample-token");
  });

  it("should update auth_token cookie and zustand state on setAuthSession", () => {
    setAuthSession(mockSession);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().session?.token).toBe("mock-jwt-token-xyz-123");
    expect(getAuthToken()).toBe("mock-jwt-token-xyz-123");
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=mock-jwt-token-xyz-123`);
  });

  it("should clear auth_token cookie and state on clearAuthSession", () => {
    setAuthSession(mockSession);
    expect(document.cookie).toContain(`${AUTH_COOKIE_NAME}=mock-jwt-token-xyz-123`);

    clearAuthSession();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().session).toBeNull();
    expect(getAuthToken()).toBeNull();
    expect(document.cookie).not.toContain("mock-jwt-token-xyz-123");
  });
});
