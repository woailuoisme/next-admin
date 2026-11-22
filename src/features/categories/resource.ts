import { z } from "zod";

import { baseTableSearchSchema } from "@/components/data-table/core/tableSearchSchema";
import { defineResource, RESOURCE_MANIFEST } from "@/lib/resource";

import type { Category, CategoryInput, CategorySearchParams } from "./types";

export const categoryInputSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
});

export const categorySearchSchema = baseTableSearchSchema.extend({
  createCategory: z.boolean().optional(),
  editCategoryId: z.string().optional(),
});

export const categoryResource = defineResource<Category, CategoryInput, CategorySearchParams, Category[]>({
  ...RESOURCE_MANIFEST.categories,
  endpoint: "categories",
  schema: categoryInputSchema,
  searchSchema: categorySearchSchema,
  paginationMode: "client",
  listUnwrap: "data",
  presentation: "dialog",
  modalKeys: {
    createKey: "createCategory",
    editKey: "editCategoryId",
  },
  i18nKeys: {
    title: "page_title",
    description: "page_description",
    heading: "page_heading",
    headingDescription: "page_heading_desc",
    createAction: "create_action",
  },
  defaultValues: {
    name: "",
    slug: "",
    description: "",
  },
  toFormValues: (cat) => ({
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
  }),
  getTitle: (cat) => cat?.name,
});
