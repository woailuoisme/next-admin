import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { DollarSign, Image as ImageIcon, Layers, Package, Tag } from "lucide-react";
import { useMemo } from "react";

import { useTranslations } from "next-intl";

import { FormDialog } from "@/components/dialogs";
import { FormSection, NumberInput, SelectInput, TextareaInput, TextInput } from "@/components/form";
import { categoryQueries } from "@/features/categories";
import { slugify } from "@/lib/slug";

import type { Product, ProductInput } from "../types";

import { useCreateProductMutation, useUpdateProductMutation } from "../hooks";
import { productQueries } from "../queries";
import { PRODUCT_STATUSES, productInputSchema } from "../schemas";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
  productIdToEdit?: string | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  productToEdit,
  productIdToEdit,
}: ProductFormDialogProps) {
  const t = useTranslations("product");
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  const { data: fetchedProduct } = useQuery({
    ...productQueries.detail(productIdToEdit ?? ""),
    enabled: Boolean(open && productIdToEdit && !productToEdit),
  });

  const effectiveProduct = productToEdit ?? fetchedProduct ?? null;
  const isEditing = Boolean(effectiveProduct);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: categories = [] } = useQuery(categoryQueries.list());

  const defaultValues = useMemo<ProductInput>(
    () => ({
      title: effectiveProduct?.title ?? "",
      slug: effectiveProduct?.slug ?? "",
      price: effectiveProduct?.price ?? 0,
      costPrice: effectiveProduct?.costPrice ?? 0,
      stock: effectiveProduct?.stock ?? 0,
      categoryId: effectiveProduct?.categoryId ?? categories[0]?.id ?? "",
      status: effectiveProduct?.status ?? "active",
      imageUrl: effectiveProduct?.imageUrl ?? DEFAULT_PRODUCT_IMAGE,
      description: effectiveProduct?.description ?? "",
    }),
    [effectiveProduct, categories],
  );

  const handleSubmit = useMemoizedFn(async ({ value }: { value: ProductInput }) => {
    if (isEditing && effectiveProduct) {
      await updateMutation.mutateAsync({
        id: effectiveProduct.id,
        input: value,
      });
    } else {
      await createMutation.mutateAsync(value);
    }
    onOpenChange(false);
  });

  const form = useForm({
    defaultValues,
    validators: {
      onChange: productInputSchema,
    },
    onSubmit: handleSubmit,
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    [categories],
  );

  const statusOptions = useMemo(() => {
    const labelMap = {
      active: t("status_active"),
      draft: t("status_draft"),
      out_of_stock: t("status_out_of_stock"),
    };
    return PRODUCT_STATUSES.map((value) => ({ label: labelMap[value], value }));
  }, [t]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      entity={effectiveProduct}
      form={form}
      defaultValues={defaultValues}
      entityName="Product"
      createTitle={t("form_create_title")}
      editTitle={t("form_edit_title")}
      description={isEditing ? t("form_edit_desc") : t("form_create_desc")}
      size="xl"
      allowFullscreen
      isSubmitting={isPending}
    >
      <div className="space-y-4">
        {/* 基本信息区块 */}
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
            onChange={(val: string) => {
              if (!isEditing && val) {
                form.setFieldValue("slug", slugify(val));
              }
            }}
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

        {/* 成本、定价与库存控制 */}
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
    </FormDialog>
  );
}
