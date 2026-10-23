import { beforeEach, describe, expect, it, vi } from "vitest";

import { forgotPasswordApi, verifyOtpApi } from "@/features/auth/api";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { readResetFlow, saveResetFlow } from "@/features/auth/resetFlow";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/forgot-password/reset",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

const EMAIL = "reset-target@example.com";

async function createResetToken() {
  const forgot = await forgotPasswordApi({ email: `${Date.now()}-${EMAIL}` });
  const verified = await verifyOtpApi({ ticket: forgot.ticket, code: forgot.devCode ?? "123456" });
  return verified.resetToken;
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    push.mockClear();
  });

  it("rejects mismatched confirmation", async () => {
    const resetToken = await createResetToken();
    const { user } = renderWithProviders(<ResetPasswordForm resetToken={resetToken} email={EMAIL} />);

    const [newPassword, confirmPassword] = screen.getAllByLabelText(/新密码/);
    await user.type(newPassword, "Strong123!");
    await user.type(confirmPassword, "Strong124!");
    await user.click(screen.getByRole("button", { name: "重置密码" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("两次输入的密码不一致。");
    expect(push).not.toHaveBeenCalled();
  });

  it("rejects a weak password", async () => {
    const resetToken = await createResetToken();
    const { user } = renderWithProviders(<ResetPasswordForm resetToken={resetToken} email={EMAIL} />);

    const [newPassword, confirmPassword] = screen.getAllByLabelText(/新密码/);
    await user.type(newPassword, "abcdefgh");
    await user.type(confirmPassword, "abcdefgh");
    await user.click(screen.getByRole("button", { name: "重置密码" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("新密码不满足强度要求。");
    expect(push).not.toHaveBeenCalled();
  });

  it("clears the flow and returns to login on success", async () => {
    const resetToken = await createResetToken();
    saveResetFlow({ ticket: "t-reset", email: EMAIL, expiresAt: Date.now() + 60_000, resetToken });

    const { user } = renderWithProviders(<ResetPasswordForm resetToken={resetToken} email={EMAIL} />);

    const [newPassword, confirmPassword] = screen.getAllByLabelText(/新密码/);
    await user.type(newPassword, "Strong123!");
    await user.type(confirmPassword, "Strong123!");
    await user.click(screen.getByRole("button", { name: "重置密码" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith(`/login?email=${encodeURIComponent(EMAIL)}`));
    expect(readResetFlow()).toBeNull();
  });
});
