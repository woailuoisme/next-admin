"use client";

import { connectField } from "../../core";
import { FileUploadCore } from "./FileUploadCore";
import type { FileUploadInputProps, FileUploadValue } from "./types";

type FileUploadExtraProps = Omit<
	FileUploadInputProps,
	"value" | "defaultValue" | "onChange" | "onBlur" | keyof import("../../core").BaseInputProps
>;

export const FileUploadInput = connectField<FileUploadValue | null, FileUploadExtraProps>(FileUploadCore);
