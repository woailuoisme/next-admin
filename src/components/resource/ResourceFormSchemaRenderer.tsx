"use client";

import { useTranslations } from "next-intl";

import { TextareaInput, TextInput } from "@/components/form/basic";
import { SelectInput } from "@/components/form/choice";
import { type UseResourceOptionsForm, useResourceOptions, useSlugSync } from "@/lib/resource/hooks";

import type {
  ResourceFormConfig,
  ResourceFormFieldSpec,
  ResourceFormInstance,
  ResourceOptionsFromResourceSpec,
  ResourceTranslateFn,
} from "./types";

interface FormFieldItemProps {
  spec: ResourceFormFieldSpec;
  form: UseResourceOptionsForm;
  isEditing: boolean;
  t: ResourceTranslateFn;
}

interface FieldDisplayMeta {
  spec: ResourceFormFieldSpec;
  label: React.ReactNode;
  placeholder?: string;
  hint?: string;
  tooltip?: string;
}

function ResourceSelectFieldItem({
  spec,
  source,
  form,
  isEditing,
  label,
  placeholder,
  hint,
  tooltip,
}: FieldDisplayMeta & {
  source: ResourceOptionsFromResourceSpec;
  form: UseResourceOptionsForm;
  isEditing: boolean;
}) {
  const { options, isLoading } = useResourceOptions(source.resource, {
    mapOption: source.mapOption,
    form: source.autoSelectFirst ? form : undefined,
    autoSelectField: source.autoSelectFirst ? spec.name : undefined,
    isEditing,
  });

  return (
    <SelectInput
      name={spec.name}
      label={label}
      required={spec.required}
      colSpan={spec.colSpan}
      options={options}
      disabled={isLoading && options.length === 0}
      placeholder={placeholder}
      hint={hint}
      tooltip={tooltip}
    />
  );
}

function ResourceTextFieldItem({
  spec,
  form,
  isEditing,
  label,
  placeholder,
  hint,
  tooltip,
}: FieldDisplayMeta & {
  form: UseResourceOptionsForm;
  isEditing: boolean;
}) {
  const handleSlugSync = useSlugSync(form, spec.slugTarget ?? "slug", Boolean(spec.slugTarget) && !isEditing);

  return (
    <TextInput
      name={spec.name}
      label={label}
      required={spec.required}
      colSpan={spec.colSpan}
      placeholder={placeholder}
      clearable={spec.clearable}
      prefix={spec.prefix}
      suffix={spec.suffix}
      hint={hint}
      tooltip={tooltip}
      onChange={spec.slugTarget ? handleSlugSync : undefined}
    />
  );
}

function FormFieldItem({ spec, form, isEditing, t }: FormFieldItemProps) {
  const label = spec.label ?? (spec.labelKey ? t(spec.labelKey) : spec.name);
  const placeholder = spec.placeholder ?? (spec.placeholderKey ? t(spec.placeholderKey) : undefined);
  const hint = spec.hintKey ? t(spec.hintKey) : undefined;
  const tooltip = spec.tooltipKey ? t(spec.tooltipKey) : undefined;

  if (spec.type === "textarea") {
    return (
      <TextareaInput
        name={spec.name}
        label={label}
        required={spec.required}
        colSpan={spec.colSpan}
        rows={spec.rows}
        placeholder={placeholder}
        hint={hint}
        tooltip={tooltip}
        showCount={spec.showCount}
        maxLength={spec.maxLength}
      />
    );
  }

  if (spec.type === "select") {
    if (spec.optionsFromResource) {
      return (
        <ResourceSelectFieldItem
          spec={spec}
          source={spec.optionsFromResource}
          form={form}
          isEditing={isEditing}
          label={label}
          placeholder={placeholder}
          hint={hint}
          tooltip={tooltip}
        />
      );
    }

    return (
      <SelectInput
        name={spec.name}
        label={label}
        required={spec.required}
        colSpan={spec.colSpan}
        options={spec.options ?? []}
        placeholder={placeholder}
        hint={hint}
        tooltip={tooltip}
      />
    );
  }

  return (
    <ResourceTextFieldItem
      spec={spec}
      form={form}
      isEditing={isEditing}
      label={label}
      placeholder={placeholder}
      hint={hint}
      tooltip={tooltip}
    />
  );
}

export interface ResourceFormSchemaRendererProps<TItem> {
  i18nNamespace: string;
  config: ResourceFormConfig<TItem>;
  form: ResourceFormInstance;
  mode: "create" | "edit";
  entity: TItem | null;
  isEditing: boolean;
  isSubmitting: boolean;
}

/**
 * 声明式表单渲染器：
 * 支持 `fields`（含 `slugTarget` 与 `optionsFromResource`）零胶水字段声明，以及复杂场景的 `render` 逃生舱插槽。
 */
export function ResourceFormSchemaRenderer<TItem>({
  i18nNamespace,
  config,
  form,
  mode,
  entity,
  isEditing,
  isSubmitting,
}: ResourceFormSchemaRendererProps<TItem>) {
  const t = useTranslations(i18nNamespace as never) as unknown as ResourceTranslateFn;

  if (config.render) {
    return <>{config.render({ form, mode, entity, isEditing, isSubmitting })}</>;
  }

  return (
    <div className="space-y-4">
      {(config.fields ?? []).map((field) => (
        <FormFieldItem key={field.name} spec={field} form={form} isEditing={isEditing} t={t} />
      ))}
    </div>
  );
}
