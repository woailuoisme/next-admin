"use client";

import * as React from "react";

import { cn } from "cn";

import type { InfolistProps } from "./types";

import { InfolistProvider } from "./InfolistContext";

export function Infolist({
	record,
	orientation = "vertical",
	dense = false,
	className,
	children,
	ref,
	...props
}: InfolistProps & { ref?: React.Ref<HTMLDivElement> }) {
	return (
		<InfolistProvider record={record} orientation={orientation} dense={dense}>
			<div ref={ref} className={cn("text-foreground flex w-full flex-col gap-6", className)} {...props}>
				{children}
			</div>
		</InfolistProvider>
	);
}
