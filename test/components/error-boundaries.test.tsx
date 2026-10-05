import { describe, expect, it, vi } from "vitest";
import { NotFoundComponent } from "@/components/layout/not-found-component";
import { RootErrorComponent } from "@/components/layout/root-error-component";
import DashboardLoading from "@/app/(dashboard)/loading";
import { renderWithProviders, screen } from "../test-utils";

describe("Error Boundaries & Layout Fallbacks", () => {
  it("should render NotFoundComponent with 404 information and action buttons", () => {
    renderWithProviders(<NotFoundComponent />);

    expect(screen.getByText("404 Not Found")).toBeInTheDocument();
    expect(screen.getByText("页面未找到 (Page Not Found)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /返回上一页/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /返回首页/ })).toBeInTheDocument();
  });

  it("should render RootErrorComponent and trigger reset callback", async () => {
    const resetMock = vi.fn();
    const error = new Error("Test runtime failure");

    const { user } = renderWithProviders(<RootErrorComponent error={error} reset={resetMock} />);

    expect(screen.getByText("页面加载遇到异常 (Page Load Error)")).toBeInTheDocument();
    expect(screen.getByText("Test runtime failure")).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: /重试/ });
    await user.click(retryButton);

    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  it("should render DashboardLoading skeleton with accessible status role", () => {
    renderWithProviders(<DashboardLoading />);

    const loadingContainer = screen.getByRole("status");
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveAttribute("aria-label", "正在加载页面内容");
  });
});
