"use client";

import { type BaseInputProps, connectField } from "@/components/form/core";

import { FileUploadCore } from "./FileUploadCore";
import type { FileUploadInputProps, FileUploadValue } from "./types";

type FileUploadExtraProps = Omit<
	FileUploadInputProps,
	"value" | "defaultValue" | "onChange" | "onBlur" | keyof BaseInputProps
>;

export const FileUploadInput = connectField<FileUploadValue | null, FileUploadExtraProps>(FileUploadCore);
