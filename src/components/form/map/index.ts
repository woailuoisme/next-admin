"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

import { MapSkeleton } from "@/components/map/shared/MapSkeleton";

export const FormLocationPicker = dynamic(() => import("./FormLocationPicker").then((mod) => mod.FormLocationPicker), {
  ssr: false,
  loading: () => createElement(MapSkeleton, { height: 320 }),
});

export type { FormLocationPickerExtraProps, FormLocationPickerProps } from "./FormLocationPicker";
export type { LocationPickerValue } from "@/components/map/picker/types";
