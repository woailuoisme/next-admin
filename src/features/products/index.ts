// Public API seam for products feature
export {
  computeProductStats,
  DEFAULT_PRODUCT_IMAGE,
  PRODUCT_STATUSES,
  productInputSchema,
  productResource,
  productSearchSchema,
  productStatusSchema,
} from "./resource";
export { ProductsActionView, ProductsListView, productUI } from "./ui";
export type {
  Product,
  ProductFilters,
  ProductInput,
  ProductListResponse,
  ProductSearchParams,
  ProductStatus,
  ProductSummary,
} from "./types";
