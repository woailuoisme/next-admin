"use client";

import { DollarSign, Image as ImageIcon, Layers, Package, Tag } from "lucide-react";

import type { ResourceTranslateFn } from "@/components/resource";
import type { SchemaNode } from "@/components/schema";
import { s } from "@/components/schema";
import { categoryResource } from "@/features/categories/resource";

import { PRODUCT_STATUSES } from "./resource";

export function buildProductFormSchema({ t }: { t: ResourceTranslateFn }): SchemaNode[] {
	const statusLabelMap = {
		active: t("status_active"),
		draft: t("status_draft"),
		out_of_stock: t("status_out_of_stock"),
	};

	return [
		s.section({
			title: t("section_basic"),
			description: t("section_basic_desc"),
			icon: <Layers className="size-4" />,
			columns: 2,
			schema: [
				s.text("title", {
					label: t("title_label"),
					required: true,
					colSpan: 2,
					placeholder: t("title_placeholder"),
					clearable: true,
					prefix: <Tag className="size-3.5" />,
					slugTarget: "slug",
				}),
				s.text("slug", {
					label: t("slug_label"),
					required: true,
					prefix: "/",
					placeholder: "wireless-anc-headphones",
					tooltip: t("slug_tooltip"),
				}),
				s.select("categoryId", {
					label: t("category_label"),
					required: true,
					placeholder: t("category_placeholder"),
					optionsFromResource: {
						resource: categoryResource,
						autoSelectFirst: true,
					},
				}),
				s.text("imageUrl", {
					label: t("image_label"),
					required: true,
					colSpan: 2,
					prefix: <ImageIcon className="size-3.5" />,
					placeholder: "https://images.unsplash.com/...",
					clearable: true,
				}),
				s.textarea("description", {
					label: t("desc_label"),
					required: true,
					colSpan: 2,
					rows: 3,
					showCount: true,
					maxLength: 300,
					placeholder: t("desc_placeholder"),
				}),
			],
		}),
		s.section({
			title: t("section_pricing"),
			description: t("section_pricing_desc"),
			icon: <DollarSign className="size-4" />,
			columns: 3,
			schema: [
				s.number("price", { label: t("price_label"), step: 0.01, min: 0.01, required: true, prefix: "$" }),
				s.number("costPrice", {
					label: t("cost_label"),
					step: 0.01,
					min: 0,
					required: true,
					prefix: "$",
					hint: t("cost_hint"),
				}),
				s.number("stock", {
					label: t("stock_label"),
					step: 1,
					min: 0,
					required: true,
					suffix: t("stock_suffix"),
					prefix: <Package className="size-3.5" />,
				}),
				s.select("status", {
					label: t("status_label"),
					required: true,
					colSpan: 3,
					options: PRODUCT_STATUSES.map((value) => ({ label: statusLabelMap[value], value })),
				}),
			],
		}),
	];
}
