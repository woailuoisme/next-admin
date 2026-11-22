import { Form, useAppForm } from "@/components/form";
import { Ban, Clock } from "lucide-react";
import { http, HttpResponse } from "msw";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { action, ActionResourceProvider } from "@/components/actions";
import { col } from "@/components/data-table/columns/col";
import type { TableStateAdapter } from "@/components/data-table/core";
import { FormDialog } from "@/components/dialogs";
import { ActionSelectEntry, SummaryEntry } from "@/components/infolist/entries";
import { defineResourceUI, ResourceStats, ResourceTable } from "@/components/resource";
import { s, SchemaRenderer } from "@/components/schema";
import { categoryResource } from "@/features/categories/resource";
import { AccessControlProvider, CanAccess, defineEndpoint, defineResource, useResourceOptions } from "@/lib/resource";
import { server } from "@/mocks/server";
import { createTestQueryClient, fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

describe("Resource Engine v2 Primitives", () => {
	describe("defineEndpoint", () => {
		it("builds RSC-safe query options and shared invalidation prefix keys", async () => {
			const fetchSummary = vi.fn(async (range: string) => ({ range, total: 42 }));
			const triggerSync = vi.fn(async (vars: { force: boolean }) => ({ synced: vars.force }));

			const metricsEndpoint = defineEndpoint({
				name: "metrics",
				queries: {
					summary: {
						key: (range: string) => ["summary", range] as const,
						queryFn: fetchSummary,
						staleTime: 15_000,
					},
				},
				actions: {
					sync: {
						mutationFn: triggerSync,
					},
				},
			});

			expect(metricsEndpoint.keys.all).toEqual(["metrics"]);
			expect(metricsEndpoint.queries.all()).toEqual(["metrics"]);

			const querySpec = metricsEndpoint.queries.summary("7d");
			expect(querySpec.queryKey).toEqual(["metrics", "summary", "7d"]);
			expect(querySpec.staleTime).toBe(15_000);
			expect(typeof querySpec.queryFn).toBe("function");
			if (typeof querySpec.queryFn === "function") {
				await expect(querySpec.queryFn({} as never)).resolves.toEqual({ range: "7d", total: 42 });
			}

			await expect(metricsEndpoint.actions.sync.mutationFn({ force: true })).resolves.toEqual({ synced: true });
		});
	});

	describe("ActionSelectEntry", () => {
		it("renders status options and displays pending indicator when mutating", () => {
			const { rerender } = renderWithProviders(
				<ActionSelectEntry
					label="履约状态"
					icon={Clock}
					value="pending"
					options={[
						{ label: "待处理", value: "pending" },
						{ label: "已发货", value: "shipped" },
					]}
					onChange={vi.fn()}
				/>,
			);

			expect(screen.getByText("履约状态")).toBeInTheDocument();
			expect(screen.getByRole("combobox", { name: "履约状态" })).toBeInTheDocument();
			expect(screen.getByText("待处理")).toBeInTheDocument();

			rerender(
				<ActionSelectEntry
					label="履约状态"
					icon={Clock}
					value="pending"
					options={[
						{ label: "待处理", value: "pending" },
						{ label: "已发货", value: "shipped" },
					]}
					isPending={true}
					pendingText="正在更新..."
					onChange={vi.fn()}
				/>,
			);

			expect(screen.getByText("正在更新...")).toBeInTheDocument();
			expect(screen.getByRole("status")).toHaveTextContent("正在更新...");
			expect(screen.getByRole("combobox", { name: "履约状态" })).toHaveAttribute("aria-busy", "true");
		});
	});

	describe("SummaryEntry", () => {
		it("formats currency breakdown lines and highlighted total", () => {
			renderWithProviders(
				<SummaryEntry
					items={[
						{ label: "小计", value: 1250 },
						{ label: "税费", value: 30 },
						{ label: "异常值", value: Number.NaN },
					]}
					total={{ label: "实付总额", value: 1280 }}
				/>,
				{ locale: "en" },
			);

			expect(screen.getByText("小计")).toBeInTheDocument();
			expect(screen.getByText("$1,250.00")).toBeInTheDocument();
			expect(screen.getByText("-")).toBeInTheDocument();
			expect(screen.getByText("实付总额")).toBeInTheDocument();
			expect(screen.getByText("$1,280.00")).toBeInTheDocument();
		});
	});

	describe("FormSchemaRenderer", () => {
		it("renders declarative fields and auto-syncs slugTarget when editing in create mode", () => {
			function Harness() {
				const form = useAppForm({
					defaultValues: { name: "", slug: "", description: "" },
					onSubmit: async () => undefined,
				});

				return (
					<Form form={form} as="div">
						<SchemaRenderer
							i18nNamespace="categories"
							form={form}
							mode="create"
							isEditing={false}
							schema={[
								s.text("name", {
									label: "分类名称",
									required: true,
									slugTarget: "slug",
								}),
								s.text("slug", {
									label: "Slug",
									required: true,
								}),
								s.textarea("description", {
									label: "备注",
								}),
							]}
						/>
					</Form>
				);
			}

			renderWithProviders(<Harness />);

			const nameInput = screen.getByLabelText(/分类名称/) as HTMLInputElement;
			const slugInput = screen.getByLabelText(/Slug/) as HTMLInputElement;

			fireEvent.change(nameInput, { target: { value: "Smart Home Audio" } });
			expect(nameInput.value).toBe("Smart Home Audio");
			expect(slugInput.value).toBe("smart-home-audio");
		});

		it("loads dynamic select options via optionsFromResource and auto-selects first option in create mode", async () => {
			function SelectHarness({ onAutoSelected }: { onAutoSelected: (val: string) => void }) {
				const form = useAppForm({
					defaultValues: { categoryId: "" },
					onSubmit: async () => undefined,
				});

				return (
					<Form form={form} as="div">
						<SchemaRenderer
							i18nNamespace="products"
							form={form}
							mode="create"
							isEditing={false}
							schema={[
								s.select("categoryId", {
									label: "所属分类",
									optionsFromResource: {
										resource: categoryResource,
										mapOption: (cat: { id: string; name: string }) => {
											onAutoSelected(cat.id);
											return { label: cat.name, value: cat.id };
										},
										autoSelectFirst: true,
									},
								}),
							]}
						/>
						<form.Subscribe selector={(state) => state.values.categoryId}>
							{(val) => <span data-testid="selected-category-id">{val}</span>}
						</form.Subscribe>
					</Form>
				);
			}

			const mapSpy = vi.fn();
			renderWithProviders(<SelectHarness onAutoSelected={mapSpy} />);

			await waitFor(() => {
				expect(mapSpy).toHaveBeenCalled();
			});

			await waitFor(() => {
				expect(screen.getByTestId("selected-category-id").textContent).not.toBe("");
			});
		});

		it("preserves useResourceOptions auto-selection after parent FormDialog reset on open without dirtying form", async () => {
			function AutoSelectFields({ form }: { form: any }) {
				useResourceOptions(categoryResource, {
					form,
					autoSelectField: "categoryId",
					isEditing: false,
				});
				return (
					<form.Subscribe selector={(state: any) => ({ categoryId: state.values.categoryId, isDirty: state.isDirty })}>
						{({ categoryId, isDirty }: { categoryId: string; isDirty: boolean }) => (
							<div>
								<span data-testid="dialog-category-id">{categoryId}</span>
								<span data-testid="dialog-is-dirty">{String(isDirty)}</span>
							</div>
						)}
					</form.Subscribe>
				);
			}

			function DialogHarness() {
				const [open, setOpen] = useState(false);
				const form = useAppForm({
					defaultValues: { categoryId: "" },
					onSubmit: async () => undefined,
				});

				return (
					<div>
						<button type="button" onClick={() => setOpen(true)}>
							打开新建弹窗
						</button>
						<FormDialog
							open={open}
							onOpenChange={setOpen}
							mode="create"
							form={form}
							defaultValues={{ categoryId: "" }}
							entityName="商品"
						>
							<AutoSelectFields form={form} />
						</FormDialog>
					</div>
				);
			}

			const { user } = renderWithProviders(<DialogHarness />);
			await user.click(screen.getByRole("button", { name: "打开新建弹窗" }));

			await waitFor(() => {
				expect(screen.getByTestId("dialog-category-id").textContent).not.toBe("");
			});
			expect(screen.getByTestId("dialog-is-dirty").textContent).toBe("false");
		});
	});

	describe("defineResourceUI", () => {
		it("produces ListView and ActionView components bound to resource and config", () => {
			const ui = defineResourceUI(categoryResource, {
				table: {
					columns: () => [col.text("name", "名称")],
				},
			});

			expect(ui.resource).toBe(categoryResource);
			expect(ui.ListView).toBeTruthy();
			expect(ui.ActionView).toBeTruthy();
		});
	});

	describe("ResourceStats", () => {
		it("renders declarative stat cards and switches to loading skeleton", () => {
			const schema = {
				columns: 2 as const,
				build: ({ total }: { total: number }) => [
					{ id: "total", title: "记录总数", value: total },
					{ id: "active", title: "启用中", value: 3 },
				],
			};

			const { container, rerender } = renderWithProviders(
				<ResourceStats i18nNamespace="categories" schema={schema} rows={[]} total={12} isLoading={false} />,
			);

			expect(screen.getByText("记录总数")).toBeInTheDocument();
			expect(screen.getByText("12")).toBeInTheDocument();
			expect(screen.getByText("启用中")).toBeInTheDocument();

			rerender(<ResourceStats i18nNamespace="categories" schema={schema} rows={[]} total={12} isLoading={true} />);
			expect(container.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
		});
	});

	describe("ResourceTable", () => {
		interface Item {
			id: string;
			name: string;
			status: "active" | "inactive";
		}

		const baseTableState: TableStateAdapter<Item> = {
			data: [{ id: "row-1", name: "Item Alpha", status: "active" }],
			total: 1,
			loading: false,
			page: 1,
			pageSize: 10,
			onPageChange: vi.fn(),
			onPageSizeChange: vi.fn(),
			onSortChange: vi.fn(),
		};

		const actionSpy = vi.fn(async (vars: { id: string }) => ({ ok: vars.id }));

		const itemResource = defineResource<
			Item,
			{ name: string },
			Record<string, unknown>,
			{ items: Item[]; total: number },
			{ archive: { mutationFn: typeof actionSpy; invalidates: readonly (readonly unknown[])[] } }
		>({
			name: "items",
			entityName: "条目",
			basePath: "/items",
			i18nNamespace: "categories",
			endpoint: "categories",
			schema: z.object({ name: z.string() }),
			defaultValues: { name: "" },
			toFormValues: (item) => ({ name: item.name }),
			actions: {
				archive: {
					mutationFn: actionSpy,
					invalidates: [["dashboard"]],
				},
			},
		});

		it("filters rowActions through AccessControlProvider", () => {
			const openView = vi.fn();
			const openEdit = vi.fn();

			renderWithProviders(
				<AccessControlProvider evaluator={({ action: act }) => act === "view"}>
					<ActionResourceProvider
						value={{
							resource: itemResource,
							rows: baseTableState.data,
							openCreate: vi.fn(),
							openEdit,
							openView,
						}}
					>
						<ResourceTable
							resource={itemResource}
							tableState={baseTableState}
							schema={{
								columns: () => [col.text<Item>("name", "名称")],
								rowActions: [
									action.view<Item>({ label: "查看详情" }),
									action.edit<Item>({ label: "编辑条目" }),
									action.delete<Item>({ label: "删除条目" }),
									action.custom<Item>({
										id: "archive",
										authorize: "edit",
										label: "归档",
										ariaLabel: "归档",
										icon: Ban,
										handler: vi.fn(),
									}),
								],
							}}
						/>
					</ActionResourceProvider>
				</AccessControlProvider>,
			);

			expect(screen.getByRole("button", { name: "查看详情" })).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: "编辑条目" })).toBeNull();
			expect(screen.queryByRole("button", { name: "删除条目" })).toBeNull();
			expect(screen.queryByRole("button", { name: "归档" })).toBeNull();
		});

		it("keeps selection intact until batchDelete confirmation and invalidates custom action scopes", async () => {
			actionSpy.mockClear();
			const batchDeleteSpy = vi.fn(async () => {});
			const deletableResource = {
				...itemResource,
				api: {
					...itemResource.api,
					batchDelete: batchDeleteSpy,
				},
			};
			const queryClient = createTestQueryClient();
			const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

			const { user } = renderWithProviders(
				<ActionResourceProvider
					value={{
						resource: deletableResource,
						rows: baseTableState.data,
						openCreate: vi.fn(),
						openEdit: vi.fn(),
						openView: vi.fn(),
					}}
				>
					<ResourceTable
						resource={deletableResource}
						tableState={baseTableState}
						schema={{
							columns: () => [col.text<Item>("name", "名称")],
							batchActions: [
								action.batchDelete<Item>({
									id: "delete",
									label: (rows) => `批量删除 (${rows.length})`,
								}),
								action.custom<Item[]>({
									id: "archive-batch",
									authorize: "edit",
									label: (rows) => `批量归档 (${rows.length})`,
									handler: async ({ payload }) => {
										await Promise.all(
											payload.map((row) => deletableResource.actions.archive.mutationFn({ id: row.id })),
										);
									},
									invalidates: [["dashboard"]],
								}),
							],
						}}
					/>
				</ActionResourceProvider>,
				{ queryClient },
			);

			const checkboxes = screen.getAllByRole("checkbox");
			const rowCheckbox = checkboxes[1];
			await user.click(rowCheckbox);
			expect(rowCheckbox).toBeChecked();

			await user.click(await screen.findByRole("button", { name: /批量删除 \(1\)/ }));
			expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
			expect(batchDeleteSpy).not.toHaveBeenCalled();
			expect(rowCheckbox).toBeChecked();

			await user.click(screen.getByRole("button", { name: "取消" }));
			expect(rowCheckbox).toBeChecked();

			await user.click(await screen.findByRole("button", { name: /批量归档 \(1\)/ }));
			await waitFor(() => {
				expect(actionSpy).toHaveBeenCalledWith({ id: "row-1" });
			});

			await waitFor(() => {
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["items"] });
				expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
			});
		});

		it("preserves row selection when a batch custom action fails", async () => {
			const failingAction = vi.fn(async (_vars: { id: string }) => {
				throw new Error("batch failed");
			});
			const failingResource = {
				...itemResource,
				actions: {
					archive: {
						mutationFn: failingAction,
						invalidates: [["dashboard"]],
					},
				},
			};

			const { user } = renderWithProviders(
				<ActionResourceProvider
					value={{
						resource: failingResource,
						rows: baseTableState.data,
						openCreate: vi.fn(),
						openEdit: vi.fn(),
						openView: vi.fn(),
					}}
				>
					<ResourceTable
						resource={failingResource}
						tableState={baseTableState}
						schema={{
							columns: () => [col.text<Item>("name", "名称")],
							batchActions: [
								action.custom<Item[]>({
									id: "archive-batch",
									authorize: "edit",
									label: (rows) => `批量归档 (${rows.length})`,
									handler: async ({ payload }) => {
										await Promise.all(payload.map((row) => failingResource.actions.archive.mutationFn({ id: row.id })));
									},
								}),
							],
						}}
					/>
				</ActionResourceProvider>,
			);

			const checkboxes = screen.getAllByRole("checkbox");
			const rowCheckbox = checkboxes[1];
			await user.click(rowCheckbox);
			expect(rowCheckbox).toBeChecked();

			await user.click(await screen.findByRole("button", { name: /批量归档 \(1\)/ }));
			await waitFor(() => {
				expect(failingAction).toHaveBeenCalledTimes(1);
			});

			// 批量操作存在失败项时应保留当前勾选状态，便于用户直接重试
			expect(rowCheckbox).toBeChecked();
		});
	});

	describe("defineResource path encoding", () => {
		it("encodes special characters in id for detail, update, delete, and batchDelete", async () => {
			const captured: Array<{ method: string; pathname: string; search: string }> = [];
			const rawId = "a/b?x=1#hash";

			server.use(
				http.get("*/encoded-items/*", ({ request }) => {
					const url = new URL(request.url);
					captured.push({ method: request.method, pathname: url.pathname, search: url.search });
					return HttpResponse.json({ code: 0, message: "ok", data: { id: rawId, name: "Item" } });
				}),
				http.patch("*/encoded-items/*", ({ request }) => {
					const url = new URL(request.url);
					captured.push({ method: request.method, pathname: url.pathname, search: url.search });
					return HttpResponse.json({ code: 0, message: "ok", data: { id: rawId, name: "Updated" } });
				}),
				http.delete("*/encoded-items/*", ({ request }) => {
					const url = new URL(request.url);
					captured.push({ method: request.method, pathname: url.pathname, search: url.search });
					return HttpResponse.json({ code: 0, message: "ok", data: null });
				}),
			);

			const encodedResource = defineResource<{ id: string; name: string }, { name: string }>({
				name: "encodedItems",
				endpoint: "encoded-items",
				basePath: "/encoded-items",
				entityName: "条目",
				schema: z.object({ name: z.string() }),
				i18nNamespace: "items",
				i18nKeys: { title: "title", description: "description" },
			});

			await encodedResource.api.detail(rawId);
			await encodedResource.api.update?.(rawId, { name: "Updated" });
			await encodedResource.api.delete?.(rawId);
			await encodedResource.api.batchDelete?.([{ id: rawId, name: "Item" }]);

			expect(captured).toHaveLength(4);
			for (const entry of captured) {
				expect(entry.pathname.endsWith("/encoded-items/a%2Fb%3Fx%3D1%23hash")).toBe(true);
				expect(entry.search).toBe("");
			}
		});
	});

	describe("CanAccess", () => {
		it("renders children when permitted and fallback when denied", () => {
			renderWithProviders(
				<AccessControlProvider evaluator={({ action }) => action === "view"}>
					<CanAccess resource="products" action="view" fallback={<span>无查看权限</span>}>
						<span>允许查看</span>
					</CanAccess>
					<CanAccess resource="products" action="delete" fallback={<span>无删除权限</span>}>
						<span>允许删除</span>
					</CanAccess>
				</AccessControlProvider>,
			);

			expect(screen.getByText("允许查看")).toBeInTheDocument();
			expect(screen.queryByText("无查看权限")).toBeNull();
			expect(screen.queryByText("允许删除")).toBeNull();
			expect(screen.getByText("无删除权限")).toBeInTheDocument();
		});
	});
});
