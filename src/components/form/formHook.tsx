"use client";

import { createFormHook } from "@tanstack/react-form";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

import { MaskedInput, NumberInput, SliderInput, TextareaInput, TextInput } from "./basic";
import {
	CascaderInput,
	CheckboxGroup,
	CheckboxInput,
	ComboboxInput,
	RadioGroupInput,
	RatingInput,
	SelectInput,
	SwitchInput,
	TagsInput,
	ToggleButtons,
	TreeSelectInput,
} from "./choice";
import { KeyValueInput, Repeater } from "./composite";
import { fieldContext, formContext, useAppFormContext } from "./core/formContexts";
import { DatePickerInput, DateRangePickerInput, TimePickerInput } from "./datetime";
import { CurrencyInput } from "./finance";
import { OtpInput, PasswordInput } from "./security";

const ColorPickerInput = dynamic(
	() => import("./media/color-picker/ColorPickerInput").then((m) => m.ColorPickerInput),
	{ ssr: false },
);
const FileUploadInput = dynamic(() => import("./media/file-upload/FileUploadInput").then((m) => m.FileUploadInput), {
	ssr: false,
});
const RichEditorInput = dynamic(() => import("./media/rich-editor/RichEditorInput").then((m) => m.RichEditorInput), {
	ssr: false,
});
const FormLocationPicker = dynamic(() => import("./map/FormLocationPicker").then((m) => m.FormLocationPicker), {
	ssr: false,
});

export interface AppSubmitButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
	label?: string;
	submittingLabel?: string;
}

/**
 * 标准表单提交按钮（供 `useAppForm` 的 `form.SubmitButton` 在 `<form.AppForm>` 内自动订阅提交与禁用状态）。
 */
export function AppFormSubmitButton({ label, submittingLabel, disabled, children, ...props }: AppSubmitButtonProps) {
	const form = useAppFormContext();
	return (
		<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
			{([canSubmit, isSubmitting]) => (
				<Button type="submit" disabled={disabled || isSubmitting || !canSubmit} {...props}>
					{isSubmitting ? (submittingLabel ?? children ?? label) : (children ?? label)}
				</Button>
			)}
		</form.Subscribe>
	);
}

/**
 * 应用级强类型 TanStack Form v1 工厂：
 * 全量注册基础、选择、日期时间、金融、安全、复合（含 Repeater 与 KeyValue）与懒加载富媒体/地图控件，
 * 其中头像上传可通过 `FileUploadInput` 的 `mode="avatar"` 统一驱动，供 `form.AppField`、`withForm` 与 `withFieldGroup` 调用。
 */
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextInput,
		TextareaInput,
		NumberInput,
		MaskedInput,
		SliderInput,
		SelectInput,
		SwitchInput,
		CheckboxInput,
		CheckboxGroup,
		RadioGroupInput,
		ComboboxInput,
		TagsInput,
		ToggleButtons,
		RatingInput,
		CascaderInput,
		TreeSelectInput,
		DatePickerInput,
		DateRangePickerInput,
		TimePickerInput,
		CurrencyInput,
		PasswordInput,
		OtpInput,
		ColorPickerInput,
		FileUploadInput,
		RichEditorInput,
		KeyValueInput,
		Repeater,
		FormLocationPicker,
	},
	formComponents: {
		SubmitButton: AppFormSubmitButton,
	},
});

export { useAppFormContext as useTypedAppFormContext };
