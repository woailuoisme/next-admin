"use client";

import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import type { LocationPickerValue } from "@/components/map/picker/types";
import type { BasemapPreset } from "@/components/map/presets/basemaps";
import { type CoordinateSystem, transformCoordinates } from "@/components/map/utils/coordinates";
import type { BaseInputProps } from "../core/types";

import { LocationPicker } from "@/components/map/picker/LocationPicker";
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

  /** Optional quick location presets rendered above the map */
  quickPresets?: Array<{ label: string; coords: { lng: number; lat: number } }>;
}

const EMPTY_PRESETS: Array<{ label: string; coords: { lng: number; lat: number } }> = [];

export const FormLocationPicker = memo(function FormLocationPicker(props: FormLocationPickerProps) {
  const t = useTranslations("form");
  const {
    id: _id,
    form: _form,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    onBlur: _onBlur,
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
    quickPresets = EMPTY_PRESETS,
    ...restPickerProps
  } = props;

  const [copied, setCopied] = useState(false);
  const [presetInteractionEpoch, setPresetInteractionEpoch] = useState(0);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(
    async (coords?: LocationPickerValue) => {
      if (!coords || typeof navigator === "undefined" || !navigator.clipboard) {
        toast.error(t("location_copy_failed"));
        return;
      }
      const text = `${coords.lng.toFixed(6)}, ${coords.lat.toFixed(6)}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
      } catch {
        toast.error(t("location_copy_failed"));
      }
    },
    [t],
  );

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
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
        const targetCRS: CoordinateSystem = restPickerProps.coordinateSystem ?? "WGS84";
        const handlePresetSelect = (presetCoords: { lng: number; lat: number }) => {
          if (isDisabled || isReadOnly) return;
          const [convertedLng, convertedLat] = transformCoordinates(
            [presetCoords.lng, presetCoords.lat],
            "WGS84",
            targetCRS,
          );
          const updated: LocationPickerValue = {
            lng: Number(convertedLng.toFixed(6)),
            lat: Number(convertedLat.toFixed(6)),
            address: undefined,
          };
          setPresetInteractionEpoch((epoch) => epoch + 1);
          onChange(updated);
          onBlur?.();
        };

        return (
          <div
            id={id}
            aria-describedby={describedBy}
            data-invalid={hasError || undefined}
            className={
              hasError ? "ring-destructive/40 flex flex-col gap-2 rounded-lg p-1 ring-1" : "flex flex-col gap-2"
            }
          >
            {(quickPresets.length > 0 || (showCopyButton && value)) && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                {quickPresets.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium">{t("location_presets")}</span>
                    {quickPresets.map((preset) => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={isDisabled || isReadOnly}
                        onClick={() => handlePresetSelect(preset.coords)}
                        className="border-border/70 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary h-6 px-2 text-[11px]"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {showCopyButton && value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-foreground h-6 text-[11px]"
                    onClick={() => handleCopy(value)}
                    title={t("location_copy_title")}
                  >
                    {copied ? (
                      <>
                        <Check className="text-primary size-3" />
                        <span className="text-primary font-medium">{t("location_copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>{t("location_copy_coords")}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <LocationPicker
              {...restPickerProps}
              externalInteractionEpoch={presetInteractionEpoch}
              showAddressSearch={showAddressSearch}
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
