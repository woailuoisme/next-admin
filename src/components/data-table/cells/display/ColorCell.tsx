import { isNil } from "es-toolkit";

import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "cn";

import type { ColorCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const shapeClasses = {
	circle: "rounded-full",
	rounded: "rounded-sm",
	square: "rounded-none",
};

export function ColorCell({
	value,
	color,
	copyable = true,
	showHex = true,
	shape = "rounded",
	checkerboard = true,
	align = "left",
	className,
}: ColorCellProps) {
	const resolvedValue = value ?? color;
	if (isNil(resolvedValue) || resolvedValue === "") {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const isAlpha =
		resolvedValue.includes("rgba") ||
		resolvedValue.includes("hsla") ||
		(resolvedValue.startsWith("#") && (resolvedValue.length === 5 || resolvedValue.length === 9));

	const showChecker = checkerboard && isAlpha;

	return (
		<div className={cn("flex items-center gap-2 select-none", JUSTIFY_ALIGN_CLASSES[align], className)}>
			<span
				className={cn(
					"relative size-4 shrink-0 overflow-hidden border border-border/80 shadow-2xs",
					shapeClasses[shape],
				)}
				aria-label={`Color swatch: ${resolvedValue}`}
			>
				{showChecker ? (
					<span
						className="absolute inset-0 bg-[linear-gradient(45deg,var(--checker)_25%,transparent_25%),linear-gradient(-45deg,var(--checker)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--checker)_75%),linear-gradient(-45deg,transparent_75%,var(--checker)_75%)] bg-[size:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0] opacity-40"
						aria-hidden="true"
					/>
				) : null}
				<span className="absolute inset-0" style={{ backgroundColor: resolvedValue }} />
			</span>
			{showHex ? (
				<span className="text-foreground/90 font-mono text-xs uppercase tabular-nums">{resolvedValue}</span>
			) : null}
			{copyable ? <CopyButton text={resolvedValue} className="size-5 rounded p-0" /> : null}
		</div>
	);
}
