import { productResource } from "@/features/products/resource";
import { ProductsListView } from "@/features/products/ui";
import { createResourceListPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(productResource);

export default createResourceListPage({
  resource: productResource,
  Component: ProductsListView,
  withStats: true,
});
