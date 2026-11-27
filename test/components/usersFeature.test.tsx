import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ActionDef } from "@/components/actions";
import { customerResource } from "@/features/users/resource";
import { customerTableConfig } from "@/features/users/table";
import type { Customer } from "@/features/users/types";
import { customerUI, UsersListView } from "@/features/users/ui";
import { AccessControlProvider } from "@/lib/resource";
import { createTestQueryClient, renderWithProviders, screen } from "test/test-utils";

describe("Users Feature Tests", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});
	it("exposes declarative customerUI config with status filter and batch suspend action", () => {
		expect(customerUI.resource.name).toBe("users");
		expect(customerUI.config.table.exportFileName).toBe("customers-directory.csv");
		expect(customerUI.config.table.batchActions).toHaveLength(1);
	});

	it("renders UsersListView with heading, status filter and customer directory rows", async () => {
		renderWithProviders(<UsersListView />);

		expect(await screen.findByText("客户账户")).toBeInTheDocument();
		expect(await screen.findByText("客户")).toBeInTheDocument();
		expect((await screen.findAllByRole("button", { name: /停用|启用/ })).length).toBeGreaterThan(0);
	});

	it("respects AccessControlProvider inside UsersListView and hides edit rowActions when unauthorized", async () => {
		renderWithProviders(
			<AccessControlProvider evaluator={({ action }) => action === "list"}>
				<UsersListView />
			</AccessControlProvider>,
		);

		expect(await screen.findByText("客户账户")).toBeInTheDocument();
		// 等待表格行数据加载完成（邮箱域名或手机列内容渲染出现后）
		expect((await screen.findAllByText(/@/)).length).toBeGreaterThan(0);
		expect(screen.queryByRole("button", { name: "停用" })).toBeNull();
		expect(screen.queryByRole("button", { name: "启用" })).toBeNull();
	});

	it("batch-suspend skips inactive users, handles partial failures, and invalidates queries", async () => {
		const queryClient = createTestQueryClient();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
		const warningSpy = vi.spyOn(toast, "warning");
		const infoSpy = vi.spyOn(toast, "info");
		const mutateSpy = vi
			.spyOn(customerResource.actions.toggleStatus, "mutationFn")
			.mockResolvedValueOnce({ id: "u-1", status: "inactive" } as Customer)
			.mockRejectedValueOnce(new Error("network fail"));

		const mockT = (key: string, values?: Record<string, unknown>) => `${key}:${JSON.stringify(values ?? {})}`;
		const batchDef =
			typeof customerTableConfig.batchActions === "function"
				? (customerTableConfig.batchActions({ t: mockT })[0] as ActionDef<Customer[], any>)
				: undefined;
		expect(batchDef?.handler).toBeDefined();

		const activeA = {
			id: "u-1",
			name: "A",
			email: "a@x.com",
			avatarUrl: "",
			totalOrders: 1,
			totalSpent: 10,
			status: "active",
			createdAt: "",
		} as Customer;
		const activeB = { ...activeA, id: "u-2", name: "B" };
		const alreadyInactive = { ...activeA, id: "u-3", name: "C", status: "inactive" as const };

		const ctx = {
			data: {},
			closeModal: () => {},
			queryClient,
			resourceBridge: null,
		};

		// Noop when all targets are already inactive
		const noopRes = await batchDef!.handler!({ ...ctx, payload: [alreadyInactive] });
		expect(noopRes).toEqual({ succeeded: 0, failed: 0, noop: true });
		expect(infoSpy).toHaveBeenCalledTimes(1);
		expect(mutateSpy).not.toHaveBeenCalled();

		// Partial failure across active rows skips inactive rows, invalidates once, and warns
		const partialRes = await batchDef!.handler!({ ...ctx, payload: [activeA, activeB, alreadyInactive] });
		expect(mutateSpy).toHaveBeenCalledTimes(2);
		expect(partialRes).toEqual({ succeeded: 1, failed: 1, noop: false });
		expect(invalidateSpy).toHaveBeenCalled();
		expect(warningSpy).toHaveBeenCalledTimes(1);
	});
});
