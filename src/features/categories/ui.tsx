"use client";

import { defineResourceUI } from "@/components/resource";

import { categoryResource } from "./resource";
import { categoryFormSchema } from "./schema";
import { categoryTableConfig } from "./table";

export const categoryUI = defineResourceUI(categoryResource, {
	table: categoryTableConfig,
	form: {
		size: "md",
		schema: categoryFormSchema,
	},
});

export const CategoriesListView = categoryUI.ListView;
