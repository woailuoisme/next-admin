// Public API seam for categories feature
export { CategoryFormDialog } from "./components/CategoryFormDialog";
export { CategoryTable } from "./components/CategoryTable";
export {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "./hooks";
export { CategoriesPage, type CategoriesPageProps } from "./pages/CategoriesPage";
export { categoryKeys, categoryQueries } from "./queries";
export { categoryInputSchema, categorySearchSchema } from "./schemas";
export type { Category, CategoryInput, CategorySearchParams } from "./types";
