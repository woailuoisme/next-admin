import { beforeEach, describe, expect, it, vi } from "vitest";

import { forgotPasswordApi, verifyOtpApi } from "@/features/auth/api";
import { VerifyOtpForm } from "@/features/auth/components/VerifyOtpForm";
import { readResetFlow, saveResetFlow, type ResetFlowState } from "@/features/auth/resetFlow";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

const push = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/forgot-password/verify",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

async function createFlow(email: string): Promise<ResetFlowState> {
  const data = await forgotPasswordApi({ email });
  return {
    ticket: data.ticket,
    email,
    expiresAt: Date.now() + data.expiresIn * 1000,
    devCode: data.devCode,
  };
}

async function typeCode(user: ReturnType<typeof renderWithProviders>["user"], code: string) {
  const input = document.querySelector("input[data-input-otp]") as HTMLInputElement;
  await user.type(input, code);
}

describe("VerifyOtpForm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    push.mockClear();
  });

  it("auto-submits on completion and stores the reset token", async () => {
    const flow = await createFlow(`verify-ok-${Date.now()}@example.com`);
    saveResetFlow(flow);
    const { user } = renderWithProviders(<VerifyOtpForm flow={flow} />);

    await typeCode(user, "123456");

    await waitFor(() => expect(push).toHaveBeenCalledWith("/forgot-password/reset"));
    expect(readResetFlow()?.resetToken).toMatch(/^reset-token-/);
  });

  it("shows an inline error for a wrong code", async () => {
    const flow = await createFlow(`verify-bad-${Date.now()}@example.com`);
    const { user } = renderWithProviders(<VerifyOtpForm flow={flow} />);

    await typeCode(user, "000000");

    expect(await screen.findByRole("alert")).toHaveTextContent("验证码不正确，请重试。");
    expect(push).not.toHaveBeenCalled();
  });

  it("locks the form and offers a restart after too many wrong codes", async () => {
    const flow = await createFlow(`verify-lock-${Date.now()}@example.com`);

    // 契约：前 5 次返回 INVALID_CODE，第 6 次返回 TOO_MANY_ATTEMPTS
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(verifyOtpApi({ ticket: flow.ticket, code: "000000" })).rejects.toBeTruthy();
    }

    const { user } = renderWithProviders(<VerifyOtpForm flow={flow} />);
    await typeCode(user, "000000");

    expect(await screen.findByRole("link", { name: /重新开始/ })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("alert")).toHaveTextContent("错误次数过多，请重新开始。");
    expect(push).not.toHaveBeenCalled();
  });

  it("starts with a resend cooldown", async () => {
    const flow = await createFlow(`verify-cooldown-${Date.now()}@example.com`);
    renderWithProviders(<VerifyOtpForm flow={flow} />);

    const resend = await screen.findByRole("button", { name: /秒后可重发/ });
    expect(resend).toBeDisabled();
  });

  it("renders the development code hint", async () => {
    const flow = await createFlow(`verify-hint-${Date.now()}@example.com`);
    renderWithProviders(<VerifyOtpForm flow={flow} />);

    expect(await screen.findByText(/本次验证码为 123456/)).toBeInTheDocument();
    expect(screen.getByText(/验证码已发送，10 分钟内有效/)).toBeInTheDocument();
  });
});
