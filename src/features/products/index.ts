// Public API seam for products feature

export { deleteProductApi } from "./api";
export { ProductFormDialog } from "./components/ProductFormDialog";
export { ProductMetricsCards } from "./components/ProductMetricsCards";
export { ProductTable } from "./components/ProductTable";
export { useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation } from "./hooks";
export { computeProductStats, ProductsPage, type ProductsPageProps } from "./pages/ProductsPage";
export { EMPTY_PRODUCT_FILTERS, productKeys, productQueries } from "./queries";
export { PRODUCT_STATUSES, productInputSchema, productSearchSchema, productStatusSchema } from "./schemas";
export type {
  Product,
  ProductFilters,
  ProductInput,
  ProductListResponse,
  ProductSearchParams,
  ProductStatus,
  ProductSummary,
} from "./types";
