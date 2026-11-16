/**
 * 列定义构造器集合。
 *
 * 约定：列工厂返回的 `renderCell` 闭包会捕获 options，且每次调用都产出新对象。
 * 列数组必须在模块级或 `useMemo` 内一次性创建，禁止在组件渲染体内直接调用工厂，
 * 否则每次 render 都会让 `normalizedColumns` 之后的整条链路重算并触发全表重渲染。
 */
export * from "./actions";
export * from "./col";
export * from "./display";
export * from "./interactive";
export * from "./media";
export type * from "./types";
