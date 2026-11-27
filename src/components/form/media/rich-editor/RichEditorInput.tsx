"use client";

import dynamic from "next/dynamic";

import { connectField, type FormFieldRenderProps } from "@/components/form/core";

import { RichEditorSkeleton } from "./RichEditorSkeleton";
import type { RichEditorInputProps } from "./types";

const DynamicPlateEditorCore = dynamic(() => import("./PlateEditorCore").then((mod) => mod.PlateEditorCore), {
	ssr: false,
	loading: () => <RichEditorSkeleton />,
});

type RichEditorExtraProps = Pick<RichEditorInputProps, "placeholder" | "minHeight" | "maxHeight" | "editorClassName">;

function RichEditorControl({
	value = "",
	minHeight = 160,
	editorClassName,
	...rest
}: FormFieldRenderProps<string> & RichEditorExtraProps) {
	return <DynamicPlateEditorCore {...rest} value={value ?? ""} minHeight={minHeight} className={editorClassName} />;
}

export const RichEditorInput = connectField<string, RichEditorExtraProps>(RichEditorControl, { defaultValue: "" });
