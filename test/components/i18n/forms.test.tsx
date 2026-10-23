import { describe, expect, it } from "vitest";

import { PasswordStrengthMeter } from "@/components/form/security/PasswordStrengthMeter";
import { renderWithProviders, screen } from "test/test-utils";

describe("Form components i18n", () => {
  it("localizes password strength labels", () => {
    const zh = renderWithProviders(<PasswordStrengthMeter password="Weak" showScoreLabel />);
    expect(screen.getByText("较弱")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<PasswordStrengthMeter password="Weak" showScoreLabel />, { locale: "en" });
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("localizes password requirements", () => {
    const zh = renderWithProviders(<PasswordStrengthMeter password="abc" />);
    expect(screen.getByText("至少 8 个字符")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<PasswordStrengthMeter password="abc" />, { locale: "en" });
    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
  });
});
