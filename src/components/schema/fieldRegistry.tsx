"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { MaskedInput, NumberInput, SliderInput, TextareaInput } from "@/components/form/basic";
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
} from "@/components/form/choice";
import { KeyValueInput, Repeater } from "@/components/form/composite";
import { DatePickerInput, DateRangePickerInput, TimePickerInput } from "@/components/form/datetime";
import { CurrencyInput } from "@/components/form/finance";
import { type ToggleButtonOption } from "@/components/form/core";
import { OtpInput, PasswordInput } from "@/components/form/security";

import { type SchemaFieldRenderArgs, SchemaResourceChoiceField, SchemaSlugTextField } from "./SchemaConnectedFields";
import type { AppFormContract, SchemaFieldSpec, SchemaFieldType, SchemaTranslateFn } from "./types";

const ColorPickerInput = dynamic(
	() => import("@/components/form/media/color-picker/ColorPickerInput").then((m) => m.ColorPickerInput),
	{ ssr: false },
);
const FileUploadInput = dynamic(
	() => import("@/components/form/media/file-upload/FileUploadInput").then((m) => m.FileUploadInput),
	{ ssr: false },
);
const RichEditorInput = dynamic(
	() => import("@/components/form/media/rich-editor/RichEditorInput").then((m) => m.RichEditorInput),
	{ ssr: false },
);
const FormLocationPicker = dynamic(
	() => import("@/components/form/map/FormLocationPicker").then((m) => m.FormLocationPicker),
	{ ssr: false },
);

export function resolveSchemaText<T extends ReactNode>(
	explicit: T | undefined,
	key: string | undefined,
	t: SchemaTranslateFn,
): T | string | undefined {
	if (explicit !== undefined) return explicit;
	return key ? t(key) : undefined;
}

type FieldRenderer = (args: SchemaFieldRenderArgs) => ReactNode;

function baseFieldProps(args: SchemaFieldRenderArgs) {
	const { spec, disabled, label, hint, tooltip } = args;
	return {
		name: spec.name,
		label,
		required: spec.required,
		colSpan: spec.colSpan,
		hint,
		tooltip,
		helperText: spec.helperText,
		disabled,
		readOnly: spec.readOnly,
	};
}

export const FIELD_REGISTRY: Record<SchemaFieldType, FieldRenderer> = {
	text: (args) => <SchemaSlugTextField {...args} />,

	textarea: (args) => (
		<TextareaInput
			{...baseFieldProps(args)}
			rows={args.spec.rows}
			placeholder={args.placeholder}
			showCount={args.spec.showCount}
			maxLength={args.spec.maxLength}
		/>
	),

	password: (args) => (
		<PasswordInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			clearable={args.spec.clearable}
			showStrength={args.spec.showStrength}
			autoComplete={args.spec.autoComplete}
		/>
	),

	number: (args) => (
		<NumberInput
			{...baseFieldProps(args)}
			min={args.spec.min}
			max={args.spec.max}
			step={args.spec.step}
			prefix={args.spec.prefix}
			suffix={args.spec.suffix}
			placeholder={args.placeholder}
		/>
	),

	slider: (args) => (
		<SliderInput
			{...baseFieldProps(args)}
			min={args.spec.min}
			max={args.spec.max}
			step={args.spec.step}
			showValue={args.spec.showValue}
			formatValue={args.spec.formatValue}
		/>
	),

	switch: (args) => (
		<SwitchInput
			{...baseFieldProps(args)}
			helperText={args.spec.helperText ?? args.spec.description}
			inline={args.spec.inline}
			onLabel={args.spec.onLabel}
			offLabel={args.spec.offLabel}
		/>
	),

	checkbox: (args) => <CheckboxInput {...baseFieldProps(args)} description={args.spec.description} />,

	checkboxGroup: (args) => (
		<CheckboxGroup
			{...baseFieldProps(args)}
			options={[...(args.spec.options ?? [])]}
			direction={args.spec.direction}
			card={args.spec.card}
		/>
	),

	date: (args) => (
		<DatePickerInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			clearable={args.spec.clearable}
			prefix={args.spec.prefix}
			dateFormat={args.spec.dateFormat}
			outputFormat={args.spec.outputFormat}
		/>
	),

	dateRange: (args) => (
		<DateRangePickerInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			clearable={args.spec.clearable}
			dateFormat={args.spec.dateFormat}
		/>
	),

	time: (args) => (
		<TimePickerInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			clearable={args.spec.clearable}
			step={args.spec.step}
		/>
	),

	select: (args) =>
		args.spec.optionsFromResource ? (
			<SchemaResourceChoiceField args={args} source={args.spec.optionsFromResource} variant="select" />
		) : (
			<SelectInput {...baseFieldProps(args)} options={[...(args.spec.options ?? [])]} placeholder={args.placeholder} />
		),

	combobox: (args) =>
		args.spec.optionsFromResource ? (
			<SchemaResourceChoiceField args={args} source={args.spec.optionsFromResource} variant="combobox" />
		) : (
			<ComboboxInput
				{...baseFieldProps(args)}
				options={[...(args.spec.options ?? [])]}
				placeholder={args.placeholder}
				searchPlaceholder={args.spec.searchPlaceholder}
				emptyText={args.spec.emptyText}
				clearable={args.spec.clearable}
			/>
		),

	radio: (args) => (
		<RadioGroupInput
			{...baseFieldProps(args)}
			options={[...(args.spec.options ?? [])]}
			direction={args.spec.direction}
			card={args.spec.card}
		/>
	),

	toggleButtons: (args) => (
		<ToggleButtons
			{...baseFieldProps(args)}
			options={args.spec.toggleOptions ?? (args.spec.options as ToggleButtonOption[] | undefined) ?? []}
			variant={args.spec.variant}
			size={args.spec.size === "md" ? "default" : args.spec.size}
			fullWidth={args.spec.fullWidth}
		/>
	),

	rating: (args) => (
		<RatingInput
			{...baseFieldProps(args)}
			count={args.spec.count ?? args.spec.max}
			allowHalf={args.spec.allowHalf}
			allowClear={args.spec.allowClear}
			showScore={args.spec.showScore}
			size={args.spec.size === "default" ? "md" : args.spec.size}
		/>
	),

	tags: (args) => (
		<TagsInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			maxTags={args.spec.maxTags}
			suggestions={args.spec.suggestions}
		/>
	),

	masked: (args) => (
		<MaskedInput
			{...baseFieldProps(args)}
			mask={args.spec.mask ?? ""}
			unmask={args.spec.unmask}
			clearable={args.spec.clearable}
			prefix={args.spec.prefix}
			suffix={args.spec.suffix}
			placeholder={args.placeholder}
		/>
	),

	currency: (args) => (
		<CurrencyInput
			{...baseFieldProps(args)}
			currency={args.spec.currency}
			currencies={args.spec.currencies}
			currencySymbol={args.spec.currencySymbol}
			decimals={args.spec.decimals}
			min={args.spec.min}
			max={args.spec.max}
			allowNegative={args.spec.allowNegative}
			placeholder={args.placeholder}
		/>
	),

	otp: (args) => (
		<OtpInput
			{...baseFieldProps(args)}
			length={args.spec.length}
			groupSize={args.spec.groupSize}
			separator={args.spec.separator}
			mask={typeof args.spec.mask === "boolean" ? args.spec.mask : undefined}
			numericOnly={args.spec.numericOnly}
		/>
	),

	color: (args) => (
		<ColorPickerInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			presets={args.spec.presets}
			clearable={args.spec.clearable}
			showEyeDropper={args.spec.showEyeDropper}
		/>
	),

	file: (args) => (
		<FileUploadInput
			{...baseFieldProps(args)}
			mode={args.spec.mode}
			accept={args.spec.accept}
			multiple={args.spec.multiple}
			maxFiles={args.spec.maxFiles}
			maxSize={args.spec.maxSize}
			endpoint={args.spec.endpoint}
			paste={args.spec.paste}
			showDownload={args.spec.showDownload}
			showRemove={args.spec.showRemove}
		/>
	),

	richEditor: (args) => (
		<RichEditorInput
			{...baseFieldProps(args)}
			placeholder={args.placeholder}
			minHeight={args.spec.minHeight}
			maxHeight={args.spec.maxHeight}
			editorClassName={args.spec.editorClassName}
		/>
	),

	cascader: (args) => (
		<CascaderInput
			{...baseFieldProps(args)}
			options={args.spec.cascaderOptions}
			loadData={args.spec.loadData}
			changeOnSelect={args.spec.changeOnSelect}
			showSearch={args.spec.showSearch}
			clearable={args.spec.clearable}
			placeholder={args.placeholder}
			searchPlaceholder={args.spec.searchPlaceholder}
			emptyText={args.spec.emptyText}
		/>
	),

	treeSelect: (args) => (
		<TreeSelectInput
			{...baseFieldProps(args)}
			treeData={args.spec.treeData}
			treeCheckable={args.spec.treeCheckable}
			treeLine={args.spec.treeLine}
			onlyLeafSelectable={args.spec.onlyLeafSelectable}
			loadData={args.spec.loadData}
			showSearch={args.spec.showSearch}
			clearable={args.spec.clearable}
			placeholder={args.placeholder}
			searchPlaceholder={args.spec.searchPlaceholder}
			emptyText={args.spec.emptyText}
		/>
	),

	keyValue: (args) => (
		<KeyValueInput
			{...baseFieldProps(args)}
			keyLabel={args.spec.keyLabel}
			valueLabel={args.spec.valueLabel}
			keyPlaceholder={args.spec.keyPlaceholder}
			valuePlaceholder={args.spec.valuePlaceholder}
			enableRawMode={args.spec.enableRawMode}
			canAdd={args.spec.canAdd}
			canDelete={args.spec.canDelete}
			reorderable={args.spec.reorderable}
		/>
	),

	repeater: (args) => (
		<Repeater
			{...baseFieldProps(args)}
			layout={args.spec.repeaterLayout}
			headers={args.spec.headers}
			createItem={args.spec.createItem ?? (() => ({}))}
			cloneItem={args.spec.cloneItem}
			renderItem={args.spec.renderItem ?? ((item) => <span className="text-xs">{JSON.stringify(item)}</span>)}
			itemTitle={args.spec.itemTitle}
			getItemKey={args.spec.getItemKey}
			addButtonText={args.spec.addButtonText}
			emptyText={args.spec.emptyText}
			showEmptyAddButton={args.spec.showEmptyAddButton}
			minItems={args.spec.minItems}
			maxItems={args.spec.maxItems}
			collapsible={args.spec.collapsible}
			defaultCollapsed={args.spec.defaultCollapsed}
			reorderable={args.spec.reorderable}
			canAdd={args.spec.canAdd}
			canDelete={args.spec.canDelete}
			canDuplicate={args.spec.canDuplicate}
			confirmDelete={args.spec.confirmDelete}
			itemErrors={args.spec.itemErrors}
			autoExpandOnError={args.spec.autoExpandOnError}
			renderSummary={args.spec.renderSummary}
			renderExtraActions={args.spec.renderExtraActions}
		/>
	),

	location: (args) => (
		<FormLocationPicker
			{...baseFieldProps(args)}
			height={args.spec.height}
			zoom={args.spec.zoom}
			basemap={args.spec.basemap}
			coordinateSystem={args.spec.coordinateSystem}
			showCoordinatesInput={args.spec.showCoordinatesInput}
			showAddressSearch={args.spec.showAddressSearch}
			showCopyButton={args.spec.showCopyButton}
			searchPlaceholder={args.spec.searchPlaceholder}
		/>
	),
};

export function SchemaFieldItem({
	spec,
	form,
	isEditing,
	disabled,
	t,
}: {
	spec: SchemaFieldSpec<any>;
	form?: AppFormContract;
	isEditing: boolean;
	disabled?: boolean;
	t: SchemaTranslateFn;
}) {
	const renderField = FIELD_REGISTRY[spec.type];
	return renderField({
		spec,
		form,
		isEditing,
		disabled: Boolean(disabled || spec.disabled),
		label: resolveSchemaText(spec.label, spec.labelKey, t) ?? spec.name,
		placeholder: resolveSchemaText(spec.placeholder, spec.placeholderKey, t),
		hint: resolveSchemaText(spec.hint, spec.hintKey, t),
		tooltip: resolveSchemaText(spec.tooltip, spec.tooltipKey, t),
	});
}
