import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock, replaceMock, searchParamsState } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  searchParamsState: { query: "" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(searchParamsState.query),
  redirect: vi.fn(),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

import { LayoutAuthProvider } from "@/components/layout/LayoutAuthContext";
import { NavUser } from "@/components/layout/sidebar/NavUser";
import { SidebarProvider } from "@/components/ui/sidebar";
import { clearAuthSession, setAuthSession } from "@/features/auth/store";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { ConnectedNotificationBell } from "@/features/notifications/components/ConnectedNotificationBell";
import { renderWithProviders, screen } from "test/test-utils";

describe("Personal workspace navigation routes", () => {
  beforeEach(() => {
    pushMock.mockClear();
    replaceMock.mockClear();
    searchParamsState.query = "";
  });

  afterEach(() => {
    searchParamsState.query = "";
  });

  it("navigates to /profile and /notifications from NavUser menu", async () => {
    const { user } = renderWithProviders(
      <LayoutAuthProvider
        user={{
          name: "Alex Morgan",
          email: "admin@nextadmin.io",
          avatar: "",
          role: "superadmin",
        }}
        onLogout={vi.fn()}
      >
        <SidebarProvider>
          <NavUser defaultOpen />
        </SidebarProvider>
      </LayoutAuthProvider>,
      { locale: "en" },
    );

    await user.click(await screen.findByText("Account Settings"));
    expect(pushMock).toHaveBeenCalledWith("/profile");

    await user.click(screen.getByRole("button", { name: /Alex Morgan/i }));
    await user.click(await screen.findByText("Notifications"));
    expect(pushMock).toHaveBeenCalledWith("/notifications");
  });

  it("navigates to /notifications when clicking View overview inside ConnectedNotificationBell", async () => {
    const { user } = renderWithProviders(<ConnectedNotificationBell />, { locale: "en" });

    const bellTrigger = screen.getByRole("button", { name: /View notifications/i });
    await user.click(bellTrigger);

    const viewAllBtn = await screen.findByRole("button", { name: /View overview/i });
    await user.click(viewAllBtn);

    expect(pushMock).toHaveBeenCalledWith("/notifications");
  });

  it("opens ProfilePage directly on ?tab=security and syncs tab changes to URL", async () => {
    searchParamsState.query = "tab=security";
    setAuthSession({
      token: "mock-token-admin-1-123456",
      admin: {
        id: "admin-1",
        name: "Alex Morgan",
        email: "admin@nextadmin.io",
        role: "superadmin",
        status: "active",
        createdAt: "2026-01-15T08:00:00Z",
        lastActiveAt: "2026-11-20T08:00:00Z",
      },
    });

    try {
      const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

      expect(await screen.findByText("Change Password")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: "Preferences" }));
      expect(replaceMock).toHaveBeenCalledWith("/profile?tab=preferences", { scroll: false });
    } finally {
      clearAuthSession();
    }
  });
});
