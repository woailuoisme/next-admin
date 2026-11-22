import { productResource } from "@/features/products/resource";
import { ProductsActionView } from "@/features/products/ui";
import { createResourceActionPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(productResource);

export default createResourceActionPage({
	resource: productResource,
	Component: ProductsActionView,
});
