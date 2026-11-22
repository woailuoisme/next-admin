import { orderResource } from "@/features/orders/resource";
import { OrdersListView } from "@/features/orders/ui";
import { createResourceListPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(orderResource);

export default createResourceListPage({
	resource: orderResource,
	Component: OrdersListView,
	withStats: true,
});
