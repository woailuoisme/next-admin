"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

import { MapSkeleton } from "@/components/map/shared/MapSkeleton";

const DynamicFormLocationPicker = dynamic(() => import("./FormLocationPicker").then((mod) => mod.FormLocationPicker), {
  ssr: false,
  loading: () => createElement(MapSkeleton, { height: 320 }),
});

export const FormLocationPicker = DynamicFormLocationPicker;
export const LazyFormLocationPicker = DynamicFormLocationPicker;
export type { FormLocationPickerProps } from "./FormLocationPicker";
export type { LocationPickerValue } from "@/components/map/picker/types";
