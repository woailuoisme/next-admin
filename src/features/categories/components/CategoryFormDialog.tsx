import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { useMemo } from "react";

import { FormDialog } from "@/components/dialogs";
import { TextareaInput, TextInput } from "@/components/form";
import { slugify } from "@/lib/slug";

import type { Category, CategoryInput } from "../types";

import { useCreateCategoryMutation, useUpdateCategoryMutation } from "../hooks";
import { categoryInputSchema } from "../schemas";
import { useTranslations } from "next-intl";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: Category | null;
}

const EMPTY_CATEGORY_FORM_VALUES: CategoryInput = {
  name: "",
  slug: "",
  description: "",
};

export function CategoryFormDialog({ open, onOpenChange, categoryToEdit }: CategoryFormDialogProps) {
  const t = useTranslations("categories");
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const isEditing = Boolean(categoryToEdit);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const defaultValues = useMemo<CategoryInput>(
    () =>
      categoryToEdit
        ? {
            name: categoryToEdit.name,
            slug: categoryToEdit.slug,
            description: categoryToEdit.description ?? "",
          }
        : EMPTY_CATEGORY_FORM_VALUES,
    [categoryToEdit],
  );

  const handleSubmit = useMemoizedFn(async ({ value }: { value: CategoryInput }) => {
    if (isEditing && categoryToEdit) {
      await updateMutation.mutateAsync({
        id: categoryToEdit.id,
        data: value,
      });
    } else {
      await createMutation.mutateAsync(value);
    }
    onOpenChange(false);
  });

  const form = useForm({
    defaultValues,
    validators: {
      onChange: categoryInputSchema,
    },
    onSubmit: handleSubmit,
  });

  const handleNameChange = useMemoizedFn((val: string) => {
    if (!isEditing && val) {
      form.setFieldValue("slug", slugify(val));
    }
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      entity={categoryToEdit}
      form={form}
      defaultValues={defaultValues}
      entityName="Category"
      description={t("form_desc")}
      size="md"
      isSubmitting={isPending}
    >
      <div className="space-y-4">
        <TextInput
          name="name"
          label={t("form_name_label")}
          required
          placeholder="e.g. Smart Home"
          onChange={handleNameChange}
        />

        <TextInput name="slug" label={t("form_slug_label")} required placeholder={t("form_slug_placeholder")} />

        <TextareaInput
          name="description"
          label={t("form_desc_label")}
          rows={3}
          placeholder={t("form_desc_placeholder")}
        />
      </div>
    </FormDialog>
  );
}
