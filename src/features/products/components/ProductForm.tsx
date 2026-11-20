"use client";

import { DollarSign, Image as ImageIcon, Layers, Package, Tag } from "lucide-react";
import { useTranslations } from "next-intl";

import { NumberInput, TextareaInput, TextInput } from "@/components/form/basic";
import { SelectInput } from "@/components/form/choice/SelectInput";
import { FormSection } from "@/components/form/layout";
import { categoryResource } from "@/features/categories/resource";
import { type UseResourceOptionsForm, useResourceOptions, useSlugSync } from "@/lib/resource";

import { PRODUCT_STATUSES } from "../resource";

export interface ProductFormProps {
  form: UseResourceOptionsForm;
  isEditing?: boolean;
}

/**
 * 纯字段声明组件：通过 `useResourceOptions` 与 `useSlugSync` 零胶水完成异步选项加载、创建态首项预选与 Slug 同步。
 */
export function ProductForm({ form, isEditing = false }: ProductFormProps) {
  const t = useTranslations("products");

  const { options: categoryOptions } = useResourceOptions(categoryResource, {
    form,
    autoSelectField: "categoryId",
    isEditing,
  });

  const labelMap = {
    active: t("status_active"),
    draft: t("status_draft"),
    out_of_stock: t("status_out_of_stock"),
  };
  const statusOptions = PRODUCT_STATUSES.map((value) => ({ label: labelMap[value], value }));

  const handleTitleChange = useSlugSync(form, "slug", !isEditing);

  return (
    <div className="space-y-4">
      <FormSection
        title={t("section_basic")}
        description={t("section_basic_desc")}
        icon={<Layers className="size-4" />}
        columns={2}
      >
        <TextInput
          name="title"
          label={t("title_label")}
          required
          colSpan={2}
          placeholder={t("title_placeholder")}
          clearable
          prefix={<Tag className="size-3.5" />}
          onChange={handleTitleChange}
        />

        <TextInput
          name="slug"
          label={t("slug_label")}
          required
          prefix="/"
          placeholder="wireless-anc-headphones"
          tooltip={t("slug_tooltip")}
        />

        <SelectInput
          name="categoryId"
          label={t("category_label")}
          required
          options={categoryOptions}
          placeholder={t("category_placeholder")}
        />

        <TextInput
          name="imageUrl"
          label={t("image_label")}
          required
          colSpan={2}
          prefix={<ImageIcon className="size-3.5" />}
          placeholder="https://images.unsplash.com/..."
          clearable
        />

        <TextareaInput
          name="description"
          label={t("desc_label")}
          required
          colSpan={2}
          rows={3}
          showCount
          maxLength={300}
          placeholder={t("desc_placeholder")}
        />
      </FormSection>

      <FormSection
        title={t("section_pricing")}
        description={t("section_pricing_desc")}
        icon={<DollarSign className="size-4" />}
        columns={3}
      >
        <NumberInput name="price" label={t("price_label")} step={0.01} min={0.01} required prefix="$" />

        <NumberInput
          name="costPrice"
          label={t("cost_label")}
          step={0.01}
          min={0}
          required
          prefix="$"
          hint={t("cost_hint")}
        />

        <NumberInput
          name="stock"
          label={t("stock_label")}
          step={1}
          min={0}
          required
          suffix={t("stock_suffix")}
          prefix={<Package className="size-3.5" />}
        />

        <SelectInput name="status" label={t("status_label")} required colSpan={3} options={statusOptions} />
      </FormSection>
    </div>
  );
}
