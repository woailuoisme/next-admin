import dynamic from "next/dynamic";
import type { FormLocationPickerProps } from "./FormLocationPicker";

const DynamicFormLocationPicker = dynamic<FormLocationPickerProps>(
  () => import("./FormLocationPicker").then((mod) => mod.FormLocationPicker),
  {
    ssr: false,
  },
);

export { DynamicFormLocationPicker as FormLocationPicker, DynamicFormLocationPicker as LazyFormLocationPicker };
export type { FormLocationPickerProps } from "./FormLocationPicker";
export type { LocationPickerValue } from "../../map/picker/types";
export type { BasemapPreset } from "../../map/presets/basemaps";
export type { CoordinateSystem } from "../../map/utils/coordinates";
