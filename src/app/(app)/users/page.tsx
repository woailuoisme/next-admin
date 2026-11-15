import { customerResource } from "@/features/users/resource";
import { UsersListView } from "@/features/users/ui";
import { createResourceListPage, createResourceMetadata } from "@/lib/resource/nextServerPage";

export const generateMetadata = createResourceMetadata(customerResource);

export default createResourceListPage({
  resource: customerResource,
  Component: UsersListView,
});
