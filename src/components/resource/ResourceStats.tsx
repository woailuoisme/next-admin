"use client";

import { useTranslations } from "next-intl";

import { StatsGrid } from "@/components/stats/grid/StatsGrid";
import { StatCard } from "@/components/stats/stat-card/StatCard";

import type { ResourceStatsSchema, ResourceTranslateFn } from "./types";

export interface ResourceStatsProps<TItem, TListResponse> {
	i18nNamespace: string;
	schema: ResourceStatsSchema<TItem, TListResponse>;
	rows: TItem[];
	total: number;
	rawResponse?: TListResponse;
	isLoading: boolean;
}

/**
 * 声明式统计卡渲染引擎：
 * 直接消费资源定义的 `stats` Schema，自动生成 `StatsGrid + StatCard[]` 并管理骨架屏状态，
 * 消除业务域重复的 `*MetricsCards.tsx` 与 `compute*Stats` 样板文件。
 */
export function ResourceStats<TItem, TListResponse>({
	i18nNamespace,
	schema,
	rows,
	total,
	rawResponse,
	isLoading,
}: ResourceStatsProps<TItem, TListResponse>) {
	const t = useTranslations(i18nNamespace as never) as unknown as ResourceTranslateFn;

	const items = schema.build({ rows, total, rawResponse, t });

	return (
		<StatsGrid
			columns={schema.columns ?? 4}
			isLoading={isLoading}
			density={schema.density}
			sparklineLayout={schema.sparklineLayout}
		>
			{items.map(({ id, ...cardProps }) => (
				<StatCard key={id} {...cardProps} />
			))}
		</StatsGrid>
	);
}
