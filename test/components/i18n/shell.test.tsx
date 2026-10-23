import { describe, expect, it } from "vitest";

import { NotFoundComponent } from "@/components/layout/NotFoundComponent";
import { GlobalSearchTrigger } from "@/components/layout/search/GlobalSearchTrigger";
import { SidebarHeader } from "@/components/layout/sidebar/SidebarHeader";
import { BackToTop } from "@/components/shared/BackToTop";
import { CopyButton } from "@/components/shared/CopyButton";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { ThemeColorPicker } from "@/components/shared/ThemeColorPicker";
import { renderWithProviders, screen } from "test/test-utils";

describe("Shared & layout components i18n", () => {
  it("localizes the help tooltip trigger", () => {
    const zh = renderWithProviders(<LabelHelpTooltip content="这是帮助文本" />);
    expect(screen.getByRole("button", { name: "查看字段帮助说明" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<LabelHelpTooltip content="Help description" />, { locale: "en" });
    expect(screen.getByRole("button", { name: "View field help tooltip" })).toBeInTheDocument();
  });

  it("localizes back-to-top", () => {
    const zh = renderWithProviders(<BackToTop threshold={0} />);
    expect(screen.getByRole("button", { name: "回到顶部" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<BackToTop threshold={0} />, { locale: "en" });
    expect(screen.getByRole("button", { name: "Back to top" })).toBeInTheDocument();
  });

  it("localizes the copy button", () => {
    const zh = renderWithProviders(<CopyButton text="abc" />);
    expect(screen.getByRole("button", { name: "点击复制" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<CopyButton text="abc" />, { locale: "en" });
    expect(screen.getByRole("button", { name: "Click to copy" })).toBeInTheDocument();
  });

  it("localizes the language switcher", () => {
    const zh = renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: "切换语言" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<LanguageSwitcher />, { locale: "en" });
    expect(screen.getByRole("button", { name: "Change language" })).toBeInTheDocument();
  });

  it("localizes the theme color picker trigger", () => {
    const zh = renderWithProviders(<ThemeColorPicker />);
    expect(screen.getByRole("button", { name: "主题与外观设置" })).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<ThemeColorPicker />, { locale: "en" });
    expect(screen.getByRole("button", { name: "Theme & appearance settings" })).toBeInTheDocument();
  });

  it("localizes the global search trigger", () => {
    const zh = renderWithProviders(<GlobalSearchTrigger />);
    expect(screen.getByText("搜索...")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<GlobalSearchTrigger />, { locale: "en" });
    expect(screen.getByText("Search...")).toBeInTheDocument();
  });

  it("keeps the sidebar brand copy stable across locales", () => {
    const zh = renderWithProviders(<SidebarHeader />);
    expect(screen.getByText("Next SN Admin")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<SidebarHeader />, { locale: "en" });
    expect(screen.getByText("Next SN Admin")).toBeInTheDocument();
  });

  it("localizes the not-found page", () => {
    const zh = renderWithProviders(<NotFoundComponent />);
    expect(screen.getByText("页面未找到")).toBeInTheDocument();
    zh.unmount();

    renderWithProviders(<NotFoundComponent />, { locale: "en" });
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });
});
