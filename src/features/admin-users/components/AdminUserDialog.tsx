import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";

import { FormDialog } from "@/components/dialogs";
import { SelectInput, TextInput } from "@/components/form";

import type { AdminRole } from "../types";

import { useCreateAdminUserMutation } from "../hooks";
import { ADMIN_ROLE_OPTIONS, adminUserInputSchema } from "../schemas";

const DEFAULT_ADMIN_USER_VALUES = {
  name: "",
  email: "",
  password: "",
  role: "admin" as AdminRole,
};

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminUserDialog({ open, onOpenChange }: AdminUserDialogProps) {
  const createMutation = useCreateAdminUserMutation();

  const handleSubmit = useMemoizedFn(
    async ({ value }: { value: typeof DEFAULT_ADMIN_USER_VALUES }) => {
      await createMutation.mutateAsync(value);
      onOpenChange(false);
    },
  );

  const form = useForm({
    defaultValues: DEFAULT_ADMIN_USER_VALUES,
    validators: {
      onChange: adminUserInputSchema,
    },
    onSubmit: handleSubmit,
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      defaultValues={DEFAULT_ADMIN_USER_VALUES}
      mode="create"
      entityName="Staff Member"
      createTitle="Add Staff Member"
      createSubmitText="Create Account"
      description="Create an internal admin account with specific portal permissions."
      size="md"
      isSubmitting={createMutation.isPending}
    >
      <div className="space-y-4">
        <TextInput name="name" label="Full Name" required placeholder="e.g. Alex Hunter" />

        <TextInput
          name="email"
          label="Work Email"
          type="email"
          required
          placeholder="alex@tanstack-shop.internal"
        />

        <TextInput
          name="password"
          label="Initial Password"
          type="password"
          required
          placeholder="••••••••"
        />

        <SelectInput
          name="role"
          label="Role & Permission Level"
          required
          options={ADMIN_ROLE_OPTIONS}
          placeholder="Select role"
        />
      </div>
    </FormDialog>
  );
}
