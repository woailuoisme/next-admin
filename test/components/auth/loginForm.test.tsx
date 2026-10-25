import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/components/LoginForm";
import { getAuthToken } from "@/features/auth/store";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    push.mockClear();
  });

  it("renders email and password inputs with initial email when provided", () => {
    renderWithProviders(<LoginForm initialEmail="admin@company.com" />);

    const emailInput = screen.getByLabelText(/邮箱/);
    expect(emailInput).toHaveValue("admin@company.com");
    expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
  });

  it("successfully logs in with valid credentials and redirects to overview", async () => {
    const { user } = renderWithProviders(<LoginForm initialEmail="admin@example.com" />);

    const emailInput = screen.getByLabelText(/邮箱/);
    const passwordInput = screen.getByLabelText(/密码/);
    const submitBtn = screen.getByRole("button", { name: "登录控制台" });

    await user.clear(emailInput);
    await user.type(emailInput, "admin@example.com");
    await user.type(passwordInput, "admin123");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/overview");
    });
    expect(getAuthToken()).toBeTruthy();
  });
});
