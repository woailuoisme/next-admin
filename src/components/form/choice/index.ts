"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export { CheckboxGroup, CheckboxInput, type CheckboxGroupProps, type CheckboxInputProps } from "./CheckboxGroup";
export { ComboboxInput, type ComboboxInputProps } from "./ComboboxInput";
export { RadioGroupInput, type RadioGroupInputProps } from "./RadioGroupInput";
export { RatingInput, type RatingInputProps } from "./RatingInput";
export { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl";
export { SelectInput, type SelectInputProps } from "./SelectInput";
export { SwitchInput, type SwitchInputProps } from "./SwitchInput";
export { TagsInput, type TagsInputProps } from "./TagsInput";
export { ToggleButtons, type ToggleButtonsProps } from "./ToggleButtons";

export type { CascaderFieldNames, CascaderOption, CascaderProps } from "./Cascader";
export type { CascaderExtraProps, CascaderInputProps } from "./CascaderInput";
export type { TreeSelectProps } from "./TreeSelect";
export type { TreeSelectExtraProps, TreeSelectInputProps } from "./TreeSelectInput";
export type { ShowCheckedStrategy, TreeSelectFieldNames, TreeSelectNode, TreeSelectValue } from "./treeEngine";

const CHOICE_TRIGGER_LOADING = () => createElement(Skeleton, { className: "h-9 w-full rounded-lg" });

export const Cascader = dynamic(() => import("./Cascader").then((mod) => mod.Cascader), {
  ssr: false,
  loading: CHOICE_TRIGGER_LOADING,
});
export const CascaderInput = dynamic(() => import("./CascaderInput").then((mod) => mod.CascaderInput), {
  ssr: false,
  loading: CHOICE_TRIGGER_LOADING,
});
export const TreeSelect = dynamic(() => import("./TreeSelect").then((mod) => mod.TreeSelect), {
  ssr: false,
  loading: CHOICE_TRIGGER_LOADING,
});
export const TreeSelectInput = dynamic(() => import("./TreeSelectInput").then((mod) => mod.TreeSelectInput), {
  ssr: false,
  loading: CHOICE_TRIGGER_LOADING,
});
