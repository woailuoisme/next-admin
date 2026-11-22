"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { RotateCcw } from "lucide-react";
import { memo, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { LocationPickerValue } from "./types";

interface LocationCoordinatesInputProps {
	value?: LocationPickerValue;
	disabled?: boolean;
	readOnly?: boolean;
	showReset?: boolean;
	onCoordinatesChange: (coords: { lng: number; lat: number }) => void;
	onConfirm?: () => void;
	onReset: () => void;
}

/** 严格有限小数校验：拒绝 `12abc`、`Infinity` 或科学记数法尾随垃圾字符 */
const STRICT_FINITE_NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

function parseStrictFinite(draft: string): number | null {
	const trimmed = draft.trim();
	if (!STRICT_FINITE_NUMBER_RE.test(trimmed)) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

function toDraft(value?: number): string {
	if (value === undefined || value === null || !Number.isFinite(value)) return "";
	return String(Number(value.toFixed(6)));
}

export const LocationCoordinatesInput = memo(function LocationCoordinatesInput({
	value,
	disabled = false,
	readOnly = false,
	showReset = true,
	onCoordinatesChange,
	onConfirm,
	onReset,
}: LocationCoordinatesInputProps) {
	const t = useTranslations("map");
	const baseId = useId();
	const lngId = `${baseId}-lng`;
	const latId = `${baseId}-lat`;

	const [lngDraft, setLngDraft] = useState(() => toDraft(value?.lng));
	const [latDraft, setLatDraft] = useState(() => toDraft(value?.lat));
	const [prevCoordinates, setPrevCoordinates] = useState(() => ({ lng: value?.lng, lat: value?.lat }));

	if (value?.lng !== prevCoordinates.lng || value?.lat !== prevCoordinates.lat) {
		setPrevCoordinates({ lng: value?.lng, lat: value?.lat });
		setLngDraft(toDraft(value?.lng));
		setLatDraft(toDraft(value?.lat));
	}

	const commit = useMemoizedFn((forceConfirm = false) => {
		if (disabled || readOnly) return;

		const lng = parseStrictFinite(lngDraft);
		const lat = parseStrictFinite(latDraft);

		if (lng === null || lat === null || lng < -180 || lng > 180 || lat < -85.0511 || lat > 85.0511) {
			setLngDraft(toDraft(value?.lng));
			setLatDraft(toDraft(value?.lat));
			return;
		}

		const changed = lng !== value?.lng || lat !== value?.lat;
		if (changed) {
			onCoordinatesChange({ lng, lat });
			return;
		}

		if (forceConfirm) onConfirm?.();
	});

	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="flex min-w-36 flex-1 items-center gap-2">
				<Label htmlFor={lngId} className="text-muted-foreground shrink-0 text-xs">
					{t("picker_longitude")}
				</Label>
				<Input
					id={lngId}
					inputMode="decimal"
					value={lngDraft}
					disabled={disabled}
					readOnly={readOnly}
					onChange={(event) => setLngDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							commit(true);
						} else if (event.key === "Escape") {
							setLngDraft(toDraft(value?.lng));
						}
					}}
					onBlur={() => commit()}
					className="h-8 font-mono text-xs"
					placeholder={t("picker_longitude")}
				/>
			</div>

			<div className="flex min-w-36 flex-1 items-center gap-2">
				<Label htmlFor={latId} className="text-muted-foreground shrink-0 text-xs">
					{t("picker_latitude")}
				</Label>
				<Input
					id={latId}
					inputMode="decimal"
					value={latDraft}
					disabled={disabled}
					readOnly={readOnly}
					onChange={(event) => setLatDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							commit(true);
						} else if (event.key === "Escape") {
							setLatDraft(toDraft(value?.lat));
						}
					}}
					onBlur={() => commit()}
					className="h-8 font-mono text-xs"
					placeholder={t("picker_latitude")}
				/>
			</div>

			{showReset && !readOnly && !disabled ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onReset}
					className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
				>
					<RotateCcw aria-hidden="true" className="size-3" />
					{t("picker_reset")}
				</Button>
			) : null}
		</div>
	);
});
