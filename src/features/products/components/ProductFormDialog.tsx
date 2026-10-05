import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { DollarSign, Image as ImageIcon, Layers, Package, Tag } from "lucide-react";
import { useMemo } from "react";

import { FormDialog } from "@/components/dialogs";
import { FormSection, NumberInput, SelectInput, TextareaInput, TextInput } from "@/components/form";
import { categoryQueries } from "@/features/categories";
import { m } from "@/i18n";

import type { Product, ProductInput } from "../types";

import { useCreateProductMutation, useUpdateProductMutation } from "../hooks";
import { productQueries } from "../queries";
import { PRODUCT_STATUS_OPTIONS, productInputSchema } from "../schemas";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60";

function slugifyTitle(val: string): string {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
      active: m.product.status_active(),
      draft: m.product.status_draft(),
      out_of_stock: m.product.status_out_of_stock(),
    };
    return PRODUCT_STATUS_OPTIONS.map((opt) => ({
      label: labelMap[opt.labelKey],
      value: opt.value,
    }));
  }, []);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      entity={effectiveProduct}
      form={form}
      defaultValues={defaultValues}
      entityName="Product"
      createTitle={m.product.form_create_title()}
      editTitle={m.product.form_edit_title()}
      description={isEditing ? m.product.form_edit_desc() : m.product.form_create_desc()}
      size="xl"
      allowFullscreen
      isSubmitting={isPending}
    >
      <div className="space-y-4">
        {/* 基本信息区块 */}
        <FormSection
          title={m.product.section_basic()}
          description={m.product.section_basic_desc()}
          icon={<Layers className="size-4" />}
          columns={2}
        >
          <TextInput
            name="title"
            label={m.product.title_label()}
            required
            colSpan={2}
            placeholder={m.product.title_placeholder()}
            clearable
            prefix={<Tag className="size-3.5" />}
            onChange={(val: string) => {
              if (!isEditing && val) {
                form.setFieldValue("slug", slugifyTitle(val));
              }
            }}
          />

          <TextInput
            name="slug"
            label={m.product.slug_label()}
            required
            prefix="/"
            placeholder="wireless-anc-headphones"
            tooltip={m.product.slug_tooltip()}
          />

          <SelectInput
            name="categoryId"
            label={m.product.category_label()}
            required
            options={categoryOptions}
            placeholder={m.product.category_placeholder()}
          />

          <TextInput
            name="imageUrl"
            label={m.product.image_label()}
            required
            colSpan={2}
            prefix={<ImageIcon className="size-3.5" />}
            placeholder="https://images.unsplash.com/..."
            clearable
          />

          <TextareaInput
            name="description"
            label={m.product.desc_label()}
            required
            colSpan={2}
            rows={3}
            showCount
            maxLength={300}
            placeholder={m.product.desc_placeholder()}
          />
        </FormSection>

        {/* 成本、定价与库存控制 */}
        <FormSection
          title={m.product.section_pricing()}
          description={m.product.section_pricing_desc()}
          icon={<DollarSign className="size-4" />}
          columns={3}
        >
          <NumberInput
            name="price"
            label={m.product.price_label()}
            step={0.01}
            min={0.01}
            required
            prefix="$"
          />

          <NumberInput
            name="costPrice"
            label={m.product.cost_label()}
            step={0.01}
            min={0}
            required
            prefix="$"
            hint={m.product.cost_hint()}
          />

          <NumberInput
            name="stock"
            label={m.product.stock_label()}
            step={1}
            min={0}
            required
            suffix={m.product.stock_suffix()}
            prefix={<Package className="size-3.5" />}
          />

          <SelectInput
            name="status"
            label={m.product.status_label()}
            required
            colSpan={3}
            options={statusOptions}
          />
        </FormSection>
      </div>
    </FormDialog>
  );
}
