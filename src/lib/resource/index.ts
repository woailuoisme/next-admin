export {
  AccessControlProvider,
  type AccessControlContextValue,
  type AccessControlEvaluator,
  type AccessControlParams,
  type AccessControlProviderProps,
  CanAccess,
  type CanAccessProps,
  createRoleAccessEvaluator,
  useAccessControl,
  useCan,
} from "./accessControl";
export {
  defineEndpoint,
  type DefineEndpointConfig,
  type EndpointDefinition,
  type EndpointQuerySpec,
} from "./defineEndpoint";
export { defineResource } from "./defineResource";
export {
  invalidateResourceScope,
  useResourceAction,
  useResourceCreate,
  useResourceDelete,
  useResourceDetail,
  useResourceList,
  useResourceOptions,
  type UseResourceOptionsConfig,
  useResourceUpdate,
  useSlugSync,
} from "./hooks";
export { APP_RESOURCE_LIST, type AppResourceName, RESOURCE_MANIFEST } from "./manifest";
export {
  APP_RESOURCES,
  buildResourceNavItems,
  mergeWithResourceMenu,
  RESOURCE_NAV_GROUPS,
  type ResourceGroupDefinition,
} from "./registry";
export type {
  DefineResourceConfig,
  ResourceActionName,
  ResourceApi,
  ResourceCustomAction,
  ResourceDefinition,
  ResourceKeys,
  ResourceManifestItem,
  ResourcePresentationConfig,
} from "./types";
