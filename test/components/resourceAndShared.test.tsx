import { describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

import { ResourcePageHeader } from "@/components/resource/ResourcePageHeader";
import { ResourceFormPage } from "@/components/resource/ResourceFormPage";
import { ResourceFormHost } from "@/components/resource/ResourceFormHost";
import { ResourceViewPage } from "@/components/resource/ResourceViewPage";
import { ResourceViewHost } from "@/components/resource/ResourceViewHost";
import { useResourceOperations } from "@/components/resource/useResourceOperations";
import { GlitchTipDiagnostic } from "@/components/shared/GlitchTipDiagnostic";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { CopyButton } from "@/components/shared/CopyButton";
import { act, renderHook } from "@testing-library/react";

describe("Resource Subsystem Components", () => {
  describe("ResourcePageHeader", () => {
    it("renders title, description, badge, and extra actions", () => {
      renderWithProviders(
        <ResourcePageHeader
          title="订单详情"
          description="查看订单全局流转与支付状态"
          badge={<span data-testid="test-badge">待发货</span>}
          extraActions={<button type="button">打印单据</button>}
        />,
      );

      expect(screen.getByText("订单详情")).toBeInTheDocument();
      expect(screen.getByText("查看订单全局流转与支付状态")).toBeInTheDocument();
      expect(screen.getByTestId("test-badge")).toBeInTheDocument();
      expect(screen.getByText("打印单据")).toBeInTheDocument();
    });

    it("renders shadcn breadcrumb items correctly", () => {
      renderWithProviders(
        <ResourcePageHeader
          title="新建商品"
          breadcrumbs={[{ label: "首页", href: "/" }, { label: "商品列表", href: "/products" }, { label: "详情录入" }]}
        />,
      );

      expect(screen.getByText("首页")).toBeInTheDocument();
      expect(screen.getByText("商品列表")).toBeInTheDocument();
      expect(screen.getByText("详情录入")).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "面包屑导航" })).toBeInTheDocument();
    });

    it("triggers back callback when back button is clicked", () => {
      const handleBack = vi.fn();
      renderWithProviders(<ResourcePageHeader title="用户详情" backTo={handleBack} backLabel="返回上一页" />);

      const backBtn = screen.getByRole("button", { name: "返回上一页" });
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("ResourceFormPage & ResourceFormHost", () => {
    it("renders ResourceFormPage with form content and action buttons", () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      const handleSaveAndContinue = vi.fn();

      renderWithProviders(
        <ResourceFormPage title="新建用户" onSubmit={handleSubmit} onSaveAndContinue={handleSaveAndContinue}>
          <div data-testid="form-field">表单字段</div>
        </ResourceFormPage>,
      );

      expect(screen.getByTestId("form-field")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存更改" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存并继续编辑" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "保存并继续编辑" }));
      expect(handleSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    it("renders ResourceFormHost in page presentation", () => {
      renderWithProviders(
        <ResourceFormHost presentation="page" title="全屏表单" description="独立页面编辑模式">
          <div>Page Host Form</div>
        </ResourceFormHost>,
      );

      expect(screen.getByText("全屏表单")).toBeInTheDocument();
      expect(screen.getByText("Page Host Form")).toBeInTheDocument();
    });
  });

  describe("ResourceViewPage & ResourceViewHost", () => {
    it("renders ResourceViewPage with edit and close actions", () => {
      const handleEdit = vi.fn();
      const handleBack = vi.fn();

      renderWithProviders(
        <ResourceViewPage title="订单 #ORD-1001" backTo={handleBack} onEdit={handleEdit}>
          <div data-testid="order-details">订单商品列表</div>
        </ResourceViewPage>,
      );

      expect(screen.getByText("订单 #ORD-1001")).toBeInTheDocument();
      expect(screen.getByTestId("order-details")).toBeInTheDocument();

      const editBtn = screen.getByRole("button", { name: "编辑" });
      fireEvent.click(editBtn);
      expect(handleEdit).toHaveBeenCalledTimes(1);

      const closeBtn = screen.getByRole("button", { name: "返回列表" });
      fireEvent.click(closeBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it("renders ResourceViewHost in page presentation", () => {
      renderWithProviders(
        <ResourceViewHost presentation="page" title="视图页面">
          <div>View Host Page</div>
        </ResourceViewHost>,
      );

      expect(screen.getByText("视图页面")).toBeInTheDocument();
      expect(screen.getByText("View Host Page")).toBeInTheDocument();
    });
  });

  describe("useResourceOperations hook", () => {
    it("resolves default presentation modes to dialog", () => {
      const { result } = renderHook(() => useResourceOperations({ basePath: "/orders" }));

      expect(result.current.createPresentation).toBe("dialog");
      expect(result.current.editPresentation).toBe("dialog");
      expect(result.current.viewPresentation).toBe("dialog");
      expect(result.current.basePath).toBe("/orders");
    });

    it("resolves per-operation presentation modes when configured", () => {
      const { result } = renderHook(() =>
        useResourceOperations({
          basePath: "/orders",
          presentation: { create: "page", edit: "drawer", view: "dialog" },
        }),
      );

      expect(result.current.createPresentation).toBe("page");
      expect(result.current.editPresentation).toBe("drawer");
      expect(result.current.viewPresentation).toBe("dialog");
    });
  });
});

describe("Shared Components", () => {
  it("renders GlitchTipDiagnostic with badge and test error trigger", () => {
    renderWithProviders(<GlitchTipDiagnostic />);

    expect(screen.getByText("异常监控 (GlitchTip)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "触发测试异常 (Test Error)" })).toBeInTheDocument();
  });

  it("renders LabelHelpTooltip with button trigger", () => {
    renderWithProviders(<LabelHelpTooltip content="帮助说明文字" />);

    expect(screen.getByRole("button", { name: "查看字段帮助说明" })).toBeInTheDocument();
  });

  it("renders CopyButton and executes copy", async () => {
    renderWithProviders(<CopyButton text="Test-Token-123" />);

    const copyBtn = screen.getByRole("button", { name: "点击复制" });
    expect(copyBtn).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(copyBtn);
    });
  });
});
