import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const { mockNotFound, mockPrefetchQuery } = vi.hoisted(() => ({
	mockNotFound: vi.fn(() => {
		throw new Error("NEXT_NOT_FOUND");
	}),
	mockPrefetchQuery: vi.fn(async () => undefined),
}));

vi.mock("next/navigation", () => ({
	notFound: mockNotFound,
}));

vi.mock("next-intl/server", () => ({
	getTranslations: vi.fn(async () => (key: string) => key),
}));

vi.mock("@/lib/queryClient", async () => {
	const { QueryClient } = await import("@tanstack/react-query");
	const client = new QueryClient();
	client.prefetchQuery = mockPrefetchQuery as unknown as typeof client.prefetchQuery;
	return {
		getQueryClient: () => client,
		prefetchWithTimeout: async (promise: Promise<unknown>) => promise,
	};
});

import { defineResource } from "@/lib/resource";
import { createResourceActionPage } from "@/lib/resource/nextServerPage";

describe("createResourceActionPage", () => {
	const testResource = defineResource({
		name: "actionItems",
		endpoint: "action-items",
		basePath: "/action-items",
		entityName: "条目",
		schema: z.object({ id: z.string(), name: z.string() }),
		i18nNamespace: "items",
		i18nKeys: { title: "title", description: "description" },
	});

	function DummyPage({ mode, id }: { mode: string; id?: string }) {
		return (
			<div data-mode={mode} data-id={id}>
				dummy
			</div>
		);
	}

	const ActionPage = createResourceActionPage({
		resource: testResource,
		Component: DummyPage,
	});

	it("calls notFound() for invalid /create/edit and whitespace id routes", async () => {
		mockNotFound.mockClear();
		await expect(ActionPage({ params: Promise.resolve({ action: ["create", "edit"] }) })).rejects.toThrow(
			"NEXT_NOT_FOUND",
		);
		await expect(ActionPage({ params: Promise.resolve({ action: ["   "] }) })).rejects.toThrow("NEXT_NOT_FOUND");
		await expect(ActionPage({ params: Promise.resolve({ action: ["", "edit"] }) })).rejects.toThrow("NEXT_NOT_FOUND");
		await expect(ActionPage({ params: Promise.resolve({ action: ["1", "edit", "extra"] }) })).rejects.toThrow(
			"NEXT_NOT_FOUND",
		);
		expect(mockNotFound).toHaveBeenCalledTimes(4);
	});

	it("allows valid /create and /:id/edit routes and prefetches detail for edit", async () => {
		mockNotFound.mockClear();
		mockPrefetchQuery.mockClear();

		const createTree = await ActionPage({ params: Promise.resolve({ action: ["create"] }) });
		expect(createTree).toBeTruthy();
		expect(mockPrefetchQuery).not.toHaveBeenCalled();

		const editTree = await ActionPage({ params: Promise.resolve({ action: ["item-42", "edit"] }) });
		expect(editTree).toBeTruthy();
		expect(mockPrefetchQuery).toHaveBeenCalledTimes(1);
		expect(mockNotFound).not.toHaveBeenCalled();
	});
});
