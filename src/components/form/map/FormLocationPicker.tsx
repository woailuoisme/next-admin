import { Check, Copy } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import type { LocationPickerValue } from "../../map/picker/types";
import type { BasemapPreset } from "../../map/presets/basemaps";
import type { CoordinateSystem } from "../../map/utils/coordinates";
import type { BaseInputProps } from "../core/types";

import { LocationPicker } from "../../map/picker/LocationPicker";
import { FormFieldEngine } from "../core/FormFieldEngine";

export interface FormLocationPickerProps extends BaseInputProps {
  /** Current coordinates value: { lng, lat, address? } */
  value?: LocationPickerValue;
  /** Default coordinates value if uncontrolled */
  defaultValue?: LocationPickerValue;
  /** Callback when coordinates change */
  onChange?: (value: LocationPickerValue) => void;
  /** Blur callback */
  onBlur?: () => void;

  /** Input and output coordinate system: WGS84, GCJ02, BD09 (default: WGS84) */
  coordinateSystem?: CoordinateSystem;

  /** Map viewport height (default: 320) */
  height?: number | string;
  /** Viewport zoom (default: 12) */
  zoom?: number;
  /** Basemap preset (default: "carto") */
  basemap?: BasemapPreset;

  /** Whether to show manual numeric lng/lat inputs below the map (default: true) */
  showCoordinatesInput?: boolean;
  /** Whether to show clear/reset button (default: true) */
  showReset?: boolean;

  /** Whether to show quick address search bar (default: true) */
  showAddressSearch?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;

  /** Whether to show quick one-click coordinate copy button (default: true) */
  showCopyButton?: boolean;
}

// Preset popular locations for quick selection
const QUICK_PRESETS: Array<{ label: string; coords: { lng: number; lat: number } }> = [
  { label: "北京", coords: { lng: 116.4074, lat: 39.9042 } },
  { label: "上海", coords: { lng: 121.4737, lat: 31.2304 } },
  { label: "深圳", coords: { lng: 114.0579, lat: 22.5431 } },
  { label: "杭州", coords: { lng: 120.1551, lat: 30.2741 } },
  { label: "广州", coords: { lng: 113.2644, lat: 23.1291 } },
];

export const FormLocationPicker = memo(function FormLocationPicker(props: FormLocationPickerProps) {
  const {
    name,
    label,
    hint,
    helperText,
    tooltip,
    error,
    required,
    disabled,
    readOnly,
    colSpan,
    className,
    hidden,
    showAddressSearch = true,
    showCopyButton = true,
    ...restPickerProps
  } = props;

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback((coords?: LocationPickerValue) => {
    if (!coords) return;
    const text = `${coords.lng.toFixed(6)}, ${coords.lat.toFixed(6)}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  }, []);

  return (
    <FormFieldEngine<LocationPickerValue>
      name={name}
      form={props.form}
      label={label}
      id={props.id}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={error}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
      disabled={disabled}
      readOnly={readOnly}
      value={props.value}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      {({ value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly }) => {
        const handlePresetSelect = (presetCoords: { lng: number; lat: number }) => {
          if (isDisabled || isReadOnly) return;
          const updated: LocationPickerValue = {
            lng: presetCoords.lng,
            lat: presetCoords.lat,
            address: undefined,
          };
          onChange(updated);
          onBlur?.();
        };

        return (
          <div className="flex flex-col gap-2">
            {showAddressSearch && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px] font-medium">常用预设:</span>
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isDisabled || isReadOnly}
                      onClick={() => handlePresetSelect(preset.coords)}
                      className="border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary rounded-md border px-2 py-0.5 text-[11px] transition-colors disabled:pointer-events-none disabled:opacity-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {showCopyButton && value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-foreground h-6 text-[11px]"
                    onClick={() => handleCopy(value)}
                    title="复制坐标"
                  >
                    {copied ? (
                      <>
                        <Check className="text-primary size-3" />
                        <span className="text-primary font-medium">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>复制经纬度</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <LocationPicker
              {...restPickerProps}
              value={value}
              onChange={(val) => {
                onChange(val);
                onBlur?.();
              }}
              disabled={isDisabled}
              readOnly={isReadOnly}
            />
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
