"use client";

import type { ComponentType } from "react";

import { FormFieldEngine, type FormFieldRenderProps } from "./FormFieldEngine";
import type { BaseInputProps } from "./types";

export interface ConnectedFieldProps<TValue> extends BaseInputProps {
	value?: TValue;
	defaultValue?: TValue;
	onChange?: (value: TValue) => void;
	onBlur?: () => void;
}

/**
 * 统一 FormFieldEngine 绑定高阶函数：
 * 自动分离 BaseInputProps 与业务控件专属 props，向内层纯展示控件注入 `FormFieldRenderProps<TValue>`，
 * 消除 20+ 个 `*Input` 包装组件中的重复属性透传样板代码。
 */
export function connectField<TValue, TControlProps extends object = Record<string, never>>(
	ControlComponent: ComponentType<FormFieldRenderProps<TValue> & TControlProps>,
	options?: { defaultValue?: TValue },
) {
	return function ConnectedField(props: ConnectedFieldProps<TValue> & TControlProps) {
		const {
			name,
			form,
			label,
			id,
			required,
			hint,
			helperText,
			tooltip,
			error,
			colSpan,
			className,
			hidden,
			disabled,
			readOnly,
			align,
			value,
			defaultValue = options?.defaultValue,
			onChange,
			onBlur,
			...controlProps
		} = props;

		return (
			<FormFieldEngine<TValue>
				name={name}
				form={form}
				label={label}
				id={id}
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
				align={align}
				value={value}
				defaultValue={defaultValue}
				onChange={onChange}
				onBlur={onBlur}
			>
				{(fieldRenderProps) => (
					<ControlComponent {...fieldRenderProps} {...(controlProps as unknown as TControlProps)} />
				)}
			</FormFieldEngine>
		);
	};
}
