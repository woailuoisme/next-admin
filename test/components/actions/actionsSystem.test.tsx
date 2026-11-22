import { ShieldAlert, Sparkles } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { action, ActionButton, ActionList } from "@/components/actions";
import { s } from "@/components/schema";
import { UsersListView } from "@/features/users/ui";
import { AccessControlProvider } from "@/lib/resource";
import { createTestQueryClient, fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

describe("Unified Filament-style Actions System", () => {
	it("runs confirmation dialog and halts when before() returns false", async () => {
		const handler = vi.fn();
		const haltBefore = vi.fn(async () => false);

		const { user } = renderWithProviders(
			<ActionButton
				action={action.custom({
					id: "halt-action",
					label: "受保护动作",
					confirm: {
						title: "确认执行？",
						description: "执行前会先经过 before 守卫校验。",
						confirmText: "继续",
					},
					before: haltBefore,
					handler,
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "受保护动作" }));
		expect(await screen.findByText("确认执行？")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "继续" }));
		await waitFor(() => {
			expect(haltBefore).toHaveBeenCalledTimes(1);
		});
		expect(handler).not.toHaveBeenCalled();
	});

	it("enforces keyword verification on destructive confirm and invalidates queries on success", async () => {
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const handler = vi.fn();
		const after = vi.fn();

		const { user } = renderWithProviders(
			<ActionButton
				action={action.custom({
					id: "purge-cache",
					label: "清理缓存",
					color: "destructive",
					icon: ShieldAlert,
					confirm: {
						title: "高危操作",
						description: "请输入 PURGE 以继续。",
						requireConfirmKeyword: "PURGE",
						confirmText: "确认清理",
					},
					handler,
					after,
					invalidates: [["dashboard"]],
				})}
			/>,
			{ queryClient },
		);

		await user.click(screen.getByRole("button", { name: "清理缓存" }));
		const confirmBtn = await screen.findByRole("button", { name: "确认清理" });
		expect(confirmBtn).toBeDisabled();

		const input = screen.getByRole("textbox");
		fireEvent.change(input, { target: { value: "PURGE" } });
		expect(confirmBtn).not.toBeDisabled();

		await user.click(confirmBtn);
		await waitFor(() => {
			expect(handler).toHaveBeenCalledTimes(1);
			expect(after).toHaveBeenCalledTimes(1);
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
		});
	});

	it("renders modal form with Zod validation and SlideOver variant", async () => {
		const submitSpy = vi.fn();
		const schema = z.object({
			reason: z.string().min(3, "Reason too short"),
		});

		const { user } = renderWithProviders(
			<ActionButton
				action={action.custom<void, { reason: string }>({
					id: "slideover-note",
					label: "填写原因",
					icon: Sparkles,
					modal: {
						variant: "sheet",
						title: "SlideOver 表单",
						submitText: "提交原因",
						schema,
						defaultValues: { reason: "" },
						fields: [s.text("reason", { label: "变更原因", required: true })],
					},
					handler: ({ data }) => submitSpy(data),
				})}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "填写原因" }));
		expect(await screen.findByText("SlideOver 表单")).toBeInTheDocument();

		const input = screen.getByLabelText(/^变更原因/);
		fireEvent.change(input, { target: { value: "Rebalancing inventory" } });

		await user.click(screen.getByRole("button", { name: "提交原因" }));
		await waitFor(() => {
			expect(submitSpy).toHaveBeenCalledWith({ reason: "Rebalancing inventory" });
		});
	});

	it("hides ActionGroup completely when all child actions are hidden or unauthorized", () => {
		renderWithProviders(
			<AccessControlProvider evaluator={({ action: act }) => act !== "delete"}>
				<ActionList
					actions={[
						action.group(
							[
								action.custom({ id: "del-only", label: "删除", authorize: "delete", handler: vi.fn() }),
								action.custom({ id: "hidden-only", label: "隐藏", hidden: true, handler: vi.fn() }),
							],
							{ id: "should-vanish", label: "更多管理" },
						),
						action.custom({ id: "visible-item", label: "可见动作", handler: vi.fn() }),
					]}
					resourceName="products"
				/>
			</AccessControlProvider>,
		);

		expect(screen.queryByRole("button", { name: /更多管理/ })).toBeNull();
		expect(screen.getByRole("button", { name: "可见动作" })).toBeInTheDocument();
	});

	it("opens confirmation dialog before suspending a customer in UsersListView", async () => {
		const { user } = renderWithProviders(<UsersListView />);

		const suspendButtons = await screen.findAllByRole("button", { name: "停用" });
		await user.click(suspendButtons[0]);

		expect(await screen.findByText("确认停用该客户？")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "取消" }));
		await waitFor(() => {
			expect(screen.queryByText("确认停用该客户？")).toBeNull();
		});
	});
});
