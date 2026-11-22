"use client";

import { Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";

import { action, type ActionEntry } from "@/components/actions";

export { buildGroupedDemos, buildModalDemos } from "./actionModalDemos";

export interface DemoArticle {
	id: string;
	title: string;
	category: string;
	status: "published" | "draft";
	views: number;
	deletedAt: string | null;
}

export const INITIAL_DEMO_ARTICLES: DemoArticle[] = [
	{
		id: "art-1",
		title: "Filament v5 Actions Architecture",
		category: "Engineering",
		status: "published",
		views: 1280,
		deletedAt: null,
	},
	{
		id: "art-2",
		title: "React Compiler Zero-Memo Guide",
		category: "Frontend",
		status: "draft",
		views: 420,
		deletedAt: null,
	},
	{
		id: "art-3",
		title: "Legacy Deprecated Endpoints",
		category: "Archive",
		status: "draft",
		views: 95,
		deletedAt: "2026-10-01T00:00:00Z",
	},
];

const importArticleSchema = z.object({
	title: z.string().min(2),
	category: z.string().min(2),
	status: z.enum(["published", "draft"]),
	views: z.number().int().min(0),
});

export function buildArticleDataActions(
	articles: DemoArticle[],
	setArticles: Dispatch<SetStateAction<DemoArticle[]>>,
	setLastEvent: (msg: string) => void,
): ActionEntry<void>[] {
	return [
		action.import<z.infer<typeof importArticleSchema>>({
			id: "showcase-import",
			label: "导入文章 (CSV / XLSX / JSON)",
			entityName: "文章",
			rowSchema: importArticleSchema,
			fields: [
				{ key: "title", label: "标题", required: true, aliases: ["name"] },
				{ key: "category", label: "分类", required: true },
				{ key: "status", label: "状态", required: true, transform: (v) => (v === "published" ? "published" : "draft") },
				{ key: "views", label: "浏览量", required: true, transform: (v) => Number(v ?? 0) },
			],
			sampleRows: [
				{ title: "Next.js 16 Turbopack", category: "Frontend", status: "published", views: 350 },
				{ title: "TanStack Query v5 Patterns", category: "Engineering", status: "draft", views: 120 },
			],
			onImport: async (validRows) => {
				const created: DemoArticle[] = validRows.map((row, idx) => ({
					id: `art-imp-${Date.now()}-${idx}`,
					...row,
					deletedAt: null,
				}));
				setArticles((prev) => [...created, ...prev]);
				setLastEvent(`导入 ${created.length} 条记录`);
			},
		}),
		action.export<void, DemoArticle>({
			id: "showcase-export",
			label: "导出文章",
			fileName: "showcase-articles",
			columns: [
				{ field: "id", headerName: "ID" },
				{ field: "title", headerName: "标题" },
				{ field: "category", headerName: "分类" },
				{ field: "status", headerName: "状态" },
				{ field: "views", headerName: "浏览量" },
			],
			resolveRows: () => articles,
		}),
	];
}

export function buildArticleRowActions(
	setArticles: Dispatch<SetStateAction<DemoArticle[]>>,
	setLastEvent: (msg: string) => void,
): ActionEntry<DemoArticle>[] {
	return [
		action.replicate<DemoArticle>({
			onReplicate: async (clone, original) => {
				const next: DemoArticle = {
					id: `art-${Date.now().toString(36)}`,
					title: `${String(clone.title ?? original.title)} (Copy)`,
					category: original.category,
					status: "draft",
					views: 0,
					deletedAt: null,
				};
				setArticles((prev) => [next, ...prev]);
				setLastEvent(`复制了文章「${original.title}」`);
			},
		}),
		action.custom<DemoArticle>({
			id: "soft-delete",
			label: "移入回收站",
			icon: Trash2,
			color: "destructive",
			hidden: (row) => Boolean(row.deletedAt),
			confirm: {
				title: "移入回收站？",
				description: (row) => `将「${row.title}」标记为软删除状态，可随时恢复或永久删除。`,
			},
			handler: ({ payload }) => {
				setArticles((prev) =>
					prev.map((item) => (item.id === payload.id ? { ...item, deletedAt: new Date().toISOString() } : item)),
				);
				setLastEvent(`软删除了「${payload.title}」`);
			},
			successMessage: "已移入回收站",
		}),
		action.restore<DemoArticle>({
			isTrashed: (row) => Boolean(row.deletedAt),
			onExecute: async (row) => {
				setArticles((prev) => prev.map((item) => (item.id === row.id ? { ...item, deletedAt: null } : item)));
				setLastEvent(`恢复了「${row.title}」`);
			},
		}),
		action.forceDelete<DemoArticle>({
			isTrashed: (row) => Boolean(row.deletedAt),
			onExecute: async (row) => {
				setArticles((prev) => prev.filter((item) => item.id !== row.id));
				setLastEvent(`永久删除了「${row.title}」`);
			},
		}),
	];
}
