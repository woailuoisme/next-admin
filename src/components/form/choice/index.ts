"use client";

import dynamic from "next/dynamic";

export * from "./SelectInput";
export * from "./ComboboxInput";
export * from "./CheckboxGroup";
export * from "./RadioGroupInput";
export * from "./SwitchInput";
export * from "./ToggleButtons";
export * from "./TagsInput";
export * from "./RatingInput";
export * from "./SegmentedControl";

export type { CascaderFieldNames, CascaderOption, CascaderProps } from "./Cascader";
export type { CascaderInputProps } from "./CascaderInput";
export type { TreeSelectProps } from "./TreeSelect";
export type { TreeSelectInputProps } from "./TreeSelectInput";
export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue } from "./treeEngine";

export const Cascader = dynamic(() => import("./Cascader").then((mod) => mod.Cascader), { ssr: false });
export const CascaderInput = dynamic(() => import("./CascaderInput").then((mod) => mod.CascaderInput), { ssr: false });
export const TreeSelect = dynamic(() => import("./TreeSelect").then((mod) => mod.TreeSelect), { ssr: false });
export const TreeSelectInput = dynamic(() => import("./TreeSelectInput").then((mod) => mod.TreeSelectInput), {
  ssr: false,
});
