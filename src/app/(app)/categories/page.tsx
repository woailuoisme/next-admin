import { categoryResource } from "@/features/categories/resource";
import { CategoriesListView } from "@/features/categories/ui";
import { createResourceListPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(categoryResource);

export default createResourceListPage({
  resource: categoryResource,
  Component: CategoriesListView,
});
