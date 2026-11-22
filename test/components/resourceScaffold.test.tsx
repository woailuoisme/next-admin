import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { TableStateAdapter } from "@/components/data-table/core";
import { ResourceScaffold, ResourceSubPageScaffold, ResourceTable } from "@/components/resource";
import { Input } from "@/components/ui/input";
import { AccessControlProvider, defineResource } from "@/lib/resource";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

interface DemoCategory {
	id: string;
	name: string;
	slug: string;
	description: string;
}

const demoSchema = z.object({
	name: z.string().min(2),
	slug: z.string().min(2),
	description: z.string(),
});

function createDemoResource(overrides?: {
	onCreate?: (input: { name: string; slug: string; description: string }) => Promise<DemoCategory>;
	detail?: (id: string) => Promise<DemoCategory>;
}) {
	const items: DemoCategory[] = [
		{ id: "cat-1", name: "智能硬件", slug: "smart-hardware", description: "Hardware items" },
	];

	return defineResource<
		DemoCategory,
		{ name: string; slug: string; description: string },
		Record<string, unknown>,
		{ items: DemoCategory[]; total: number }
	>({
		name: "categories",
		entityName: "Category",
		basePath: "/categories",
		endpoint: "categories",
		i18nNamespace: "categories",
		schema: demoSchema,
		i18nKeys: {
			title: "page_title",
			description: "page_description",
			heading: "page_heading",
			headingDescription: "page_heading_desc",
			createAction: "create_action",
		},
		defaultValues: { name: "", slug: "", description: "" },
		toFormValues: (cat) => ({ name: cat.name, slug: cat.slug, description: cat.description }),
		getTitle: (cat) => cat?.name,
		api: {
			list: async () => ({ items, total: items.length }),
			detail: overrides?.detail ?? (async (id) => items.find((item) => item.id === id) ?? items[0]),
			create:
				overrides?.onCreate ??
				(async (input) => ({
					id: "cat-new",
					...input,
				})),
			update: async (id, input) => ({
				id,
				name: input.name ?? "Updated",
				slug: input.slug ?? "updated",
				description: input.description ?? "",
			}),
			delete: async () => {},
		},
	});
}

describe("ResourceScaffold & ResourceSubPageScaffold", () => {
	it("opens create modal on ResourceScaffold and submits resource.api.create", async () => {
		const createSpy = vi.fn(async (input: { name: string; slug: string; description: string }) => ({
			id: "cat-2",
			...input,
		}));
		const demoResource = createDemoResource({ onCreate: createSpy });

		renderWithProviders(
			<ResourceScaffold
				resource={demoResource}
				renderTable={({ rows, openEdit }) => (
					<div>
						{rows.map((row) => (
							<div key={row.id}>
								<span>{row.name}</span>
								<button type="button" onClick={() => openEdit(row.id)}>
									Edit Row
								</button>
							</div>
						))}
					</div>
				)}
				renderForm={({ form }) => (
					<div>
						<form.Field name="name">
							{(field: any) => (
								<Input
									aria-label="Category Name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
						<form.Field name="slug">
							{(field: any) => (
								<Input
									aria-label="Category Slug"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>
				)}
			/>,
		);

		expect(await screen.findByText("智能硬件")).toBeInTheDocument();

		const createBtn = screen.getByRole("button", { name: /新增分类/ });
		fireEvent.click(createBtn);

		const nameInput = await screen.findByLabelText("Category Name");
		const slugInput = await screen.findByLabelText("Category Slug");

		fireEvent.change(nameInput, { target: { value: "办公外设" } });
		fireEvent.change(slugInput, { target: { value: "office-gear" } });

		const submitBtn = screen.getAllByRole("button").find((btn) => btn.getAttribute("type") === "submit");
		expect(submitBtn).toBeDefined();
		fireEvent.click(submitBtn!);

		await waitFor(() => {
			expect(createSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "办公外设",
					slug: "office-gear",
				}),
			);
		});
	});

	it("hides create button and disables edit/delete actions when AccessControlProvider denies permission", async () => {
		const demoResource = createDemoResource();

		renderWithProviders(
			<AccessControlProvider evaluator={() => false}>
				<ResourceScaffold
					resource={demoResource}
					renderTable={({ canEdit, canDelete }) => (
						<div>
							<span>{canEdit ? "EDIT_ALLOWED" : "EDIT_DENIED"}</span>
							<span>{canDelete ? "DELETE_ALLOWED" : "DELETE_DENIED"}</span>
						</div>
					)}
				/>
			</AccessControlProvider>,
		);

		expect(await screen.findByText("分类目录")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /新增分类/ })).toBeNull();
		expect(screen.getByText("EDIT_DENIED")).toBeInTheDocument();
		expect(screen.getByText("DELETE_DENIED")).toBeInTheDocument();
	});

	it("renders ResourceSubPageScaffold in create mode without crashing", async () => {
		const demoResource = createDemoResource();

		renderWithProviders(
			<ResourceSubPageScaffold
				resource={demoResource}
				mode="create"
				renderForm={({ form }) => (
					<form.Field name="name">
						{(field: any) => (
							<Input
								aria-label="SubPage Category Name"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						)}
					</form.Field>
				)}
			/>,
		);

		expect(await screen.findByLabelText("SubPage Category Name")).toBeInTheDocument();
	});

	it("blocks submit during edit mode while entity detail is loading (prevents create fallback race)", async () => {
		const createSpy = vi.fn();
		const demoResource = createDemoResource({
			onCreate: createSpy,
			detail: () => new Promise<DemoCategory>(() => {}),
		});

		renderWithProviders(
			<ResourceSubPageScaffold
				resource={demoResource}
				mode="edit"
				id="pending-id"
				renderForm={({ form }) => (
					<form.Field name="name">
						{(field: any) => (
							<Input
								aria-label="Edit Pending Name"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
							/>
						)}
					</form.Field>
				)}
			/>,
		);

		await screen.findByLabelText("Edit Pending Name");
		expect(screen.getByRole("status")).toBeInTheDocument();
		const submitBtn = screen.getAllByRole("button").find((btn) => btn.getAttribute("type") === "submit");
		expect(submitBtn).toBeDefined();
		expect(submitBtn).toBeDisabled();
		expect(createSpy).not.toHaveBeenCalled();
	});

	it("resets Save & Continue flag if mutation rejects so subsequent regular submit closes the modal", async () => {
		const createSpy = vi
			.fn()
			.mockRejectedValueOnce(new Error("create failed"))
			.mockResolvedValueOnce({ id: "cat-3", name: "新硬件", slug: "new-hw", description: "" });
		const demoResource = createDemoResource({ onCreate: createSpy });

		renderWithProviders(
			<ResourceScaffold
				resource={demoResource}
				renderTable={({ rows }) => (
					<div>
						{rows.map((row) => (
							<span key={row.id}>{row.name}</span>
						))}
					</div>
				)}
				renderForm={({ form }) => (
					<div>
						<form.Field name="name">
							{(field: any) => (
								<Input
									aria-label="Category Name"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
						<form.Field name="slug">
							{(field: any) => (
								<Input
									aria-label="Category Slug"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						</form.Field>
					</div>
				)}
			/>,
		);

		expect(await screen.findByText("智能硬件")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /新增分类/ }));

		const nameInput = await screen.findByLabelText("Category Name");
		const slugInput = await screen.findByLabelText("Category Slug");
		fireEvent.change(nameInput, { target: { value: "新硬件" } });
		fireEvent.change(slugInput, { target: { value: "new-hw" } });

		// 1. Trigger Save & Continue while create rejects
		const saveAndContinueBtn = screen.getByRole("button", { name: /保存并继续/ });
		fireEvent.click(saveAndContinueBtn);

		await waitFor(() => {
			expect(createSpy).toHaveBeenCalledTimes(1);
		});
		// Dialog remains open because create failed
		expect(screen.getByLabelText("Category Name")).toBeInTheDocument();

		// 2. Subsequent regular submit should close the dialog (keepOpenAfterSubmitRef must be false)
		const submitBtn = screen.getAllByRole("button").find((btn) => btn.getAttribute("type") === "submit");
		expect(submitBtn).toBeDefined();
		fireEvent.click(submitBtn!);

		await waitFor(() => {
			expect(createSpy).toHaveBeenCalledTimes(2);
			expect(screen.queryByLabelText("Category Name")).toBeNull();
		});
	});

	it("enforces view permission on ResourceTable onRowClick='view'", () => {
		const demoResource = createDemoResource();
		const openView = vi.fn();
		const row: DemoCategory = {
			id: "cat-1",
			name: "智能硬件",
			slug: "smart-hardware",
			description: "Hardware items",
		};

		function TableHarness({ allowView }: { allowView: boolean }) {
			const tableState: TableStateAdapter<DemoCategory> = {
				data: [row],
				total: 1,
				loading: false,
				paginationMode: "client",
				page: 1,
				pageSize: 20,
				onPageChange: vi.fn(),
				onPageSizeChange: vi.fn(),
				onSortChange: vi.fn(),
			};
			return (
				<AccessControlProvider evaluator={({ action }) => (action === "view" ? allowView : true)}>
					<ResourceTable
						resource={demoResource}
						schema={{
							columns: () => [{ field: "name", headerName: "Name" }],
							onRowClick: "view",
						}}
						tableState={tableState}
						onRowView={openView}
					/>
				</AccessControlProvider>
			);
		}

		const denied = renderWithProviders(<TableHarness allowView={false} />);
		fireEvent.click(screen.getByText("智能硬件"));
		expect(openView).not.toHaveBeenCalled();
		denied.unmount();

		renderWithProviders(<TableHarness allowView={true} />);
		fireEvent.click(screen.getByText("智能硬件"));
		expect(openView).toHaveBeenCalledWith("cat-1");
	});
});
