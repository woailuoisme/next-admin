import { beforeEach, describe, expect, it, vi } from "vitest";

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { readResetFlow } from "@/features/auth/resetFlow";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/forgot-password",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    push.mockClear();
  });

  it("blocks submit when the email is invalid", async () => {
    const { user } = renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/邮箱/), "not-an-email");
    await user.click(screen.getByRole("button", { name: "发送验证码" }));

    await waitFor(() => expect(push).not.toHaveBeenCalled());
    expect(readResetFlow()).toBeNull();
  });

  it("explains why the user is back at step one after a timeout", () => {
    renderWithProviders(<ForgotPasswordForm expired />);

    expect(screen.getByRole("status")).toHaveTextContent("重置会话已过期，请重新开始。");
  });

  it("stores the ticket and moves on even when the email is unknown", async () => {
    const { user } = renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/邮箱/), `forgot-${Date.now()}@example.com`);
    await user.click(screen.getByRole("button", { name: "发送验证码" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/forgot-password/verify"));

    const flow = readResetFlow();
    expect(flow?.ticket).toMatch(/^reset-ticket-/);
    expect(flow?.email).toContain("forgot-");
    expect(flow?.devCode).toBe("123456");
  });
});
