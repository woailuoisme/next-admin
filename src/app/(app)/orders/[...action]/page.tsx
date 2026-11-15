import { orderResource } from "@/features/orders/resource";
import { OrdersActionView } from "@/features/orders/ui";
import { createResourceActionPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(orderResource);

export default createResourceActionPage({
  resource: orderResource,
  Component: OrdersActionView,
});
