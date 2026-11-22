import { describe, expect, it, vi } from "vitest";
import React from "react";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

import { FormDialog, PageHeader, ViewDialog } from "@/components/dialogs";
import { GlitchTipDiagnostic } from "@/components/shared/GlitchTipDiagnostic";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { CopyButton } from "@/components/shared/CopyButton";
import { act } from "@testing-library/react";

describe("Resource Subsystem Components", () => {
	describe("PageHeader", () => {
		it("renders title, description, badge, and extra actions", () => {
			renderWithProviders(
				<PageHeader
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
				<PageHeader
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
			renderWithProviders(<PageHeader title="用户详情" backTo={handleBack} backLabel="返回上一页" />);

			const backBtn = screen.getByRole("button", { name: "返回上一页" });
			fireEvent.click(backBtn);
			expect(handleBack).toHaveBeenCalledTimes(1);
		});
	});

	describe("FormDialog page presentation", () => {
		it("renders FormDialog in page presentation with form content and action buttons", () => {
			const handleSubmit = vi.fn((e) => e.preventDefault());
			const handleSaveAndContinue = vi.fn();

			renderWithProviders(
				<FormDialog
					presentation="page"
					title="新建用户"
					onSubmit={handleSubmit}
					onSaveAndContinue={handleSaveAndContinue}
				>
					<div data-testid="form-field">表单字段</div>
				</FormDialog>,
			);

			expect(screen.getByTestId("form-field")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "保存更改" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "保存并继续编辑" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();

			fireEvent.click(screen.getByRole("button", { name: "保存并继续编辑" }));
			expect(handleSaveAndContinue).toHaveBeenCalledTimes(1);
		});
	});

	describe("ViewDialog page presentation", () => {
		it("renders ViewDialog in page presentation with edit and close actions", () => {
			const handleEdit = vi.fn();
			const handleBack = vi.fn();

			renderWithProviders(
				<ViewDialog presentation="page" title="订单 #ORD-1001" backTo={handleBack} onEdit={handleEdit}>
					<div data-testid="order-details">订单商品列表</div>
				</ViewDialog>,
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

	it("blocks unsafe javascript URLs in ImageLightboxModal", () => {
		renderWithProviders(<ImageLightboxModal url="javascript:alert(1)" onClose={vi.fn()} />);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});
});
