import { describe, expect, it } from "vitest";

import { customerUI, UsersListView } from "@/features/users/ui";
import { AccessControlProvider } from "@/lib/resource";
import { renderWithProviders, screen } from "test/test-utils";

describe("Users Feature Tests", () => {
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
});
