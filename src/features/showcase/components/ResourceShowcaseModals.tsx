"use client";

import { toast } from "sonner";

import { FormDialog, ViewDialog } from "@/components/dialogs";
import { useAppForm } from "@/components/form";
import type { ResourcePresentation } from "@/components/resource";
import { SchemaRenderer } from "@/components/schema";
import { Badge } from "@/components/ui/badge";

import {
	CUSTOMER_INFOLIST_SCHEMA,
	type SampleCustomer,
	SHOWCASE_ACCENT_CLASSES,
	TIER_OPTIONS,
} from "./resourceShowcaseData";

export interface ResourceShowcaseModalsProps {
	presentation: ResourcePresentation;
	customer: SampleCustomer;
	onSaveCustomer: (next: SampleCustomer) => void;
	isCreateOpen: boolean;
	isEditOpen: boolean;
	isViewOpen: boolean;
	isEditing: boolean;
	newCustomerDefaults: SampleCustomer;
	onCloseForm: () => void;
	onCloseView: () => void;
	onOpenEdit: (id: string) => void;
}

export function ResourceShowcaseModals({
	presentation,
	customer,
	onSaveCustomer,
	isCreateOpen,
	isEditOpen,
	isViewOpen,
	isEditing,
	newCustomerDefaults,
	onCloseForm,
	onCloseView,
	onOpenEdit,
}: ResourceShowcaseModalsProps) {
	const form = useAppForm({
		defaultValues: isEditing ? customer : newCustomerDefaults,
		onSubmit: async ({ value }) => {
			await new Promise((r) => setTimeout(r, 600));
			onSaveCustomer(value as SampleCustomer);
			toast.success(isEditing ? "Customer details updated successfully!" : "New customer record created successfully!");
			onCloseForm();
		},
	});

	return (
		<>
			<FormDialog
				presentation={presentation}
				open={isCreateOpen || isEditOpen}
				onOpenChange={(next) => {
					if (!next) onCloseForm();
				}}
				title={isCreateOpen ? "Create Customer" : `Edit ${customer.name}`}
				description="Manage organization customer records and enterprise account settings."
				badge={
					<Badge variant="secondary" className="text-[10px]">
						{customer.tier.toUpperCase()}
					</Badge>
				}
				size="lg"
				breadcrumbs={[
					{ label: "Dashboard", href: "/" },
					{ label: "Customers", href: "/customers" },
					{ label: isCreateOpen ? "Create" : "Edit", active: true },
				]}
				backTo={onCloseForm}
				backLabel="Return to showcase"
				submitText={isCreateOpen ? "Create Customer" : "Save Changes"}
				saveAndContinueText="Save & Continue Editing"
				onSaveAndContinue={async () => {
					await form.handleSubmit();
					toast.info("Saved! Ready for continued editing.");
				}}
				onSubmit={() => form.handleSubmit()}
				onCancel={onCloseForm}
			>
				<form.AppForm>
					<div className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<form.AppField name="name">
								{(field) => <field.TextInput label="Customer Name" required placeholder="e.g. Acme Corporation" />}
							</form.AppField>
							<form.AppField name="email">
								{(field) => (
									<field.TextInput label="Contact Email" required type="email" placeholder="contact@company.com" />
								)}
							</form.AppField>
							<form.AppField name="company">
								{(field) => <field.TextInput label="Organization / Company" placeholder="Company name" />}
							</form.AppField>
							<form.AppField name="tier">
								{(field) => <field.SelectInput label="Subscription Tier" options={TIER_OPTIONS} />}
							</form.AppField>
						</div>

						<form.AppField name="notes">
							{(field) => <field.TextInput label="Account Notes" placeholder="Strategic notes, renewal reminders..." />}
						</form.AppField>

						<form.AppField name="isActive">
							{(field) => (
								<field.SwitchInput
									label="Active Account Status"
									helperText="Enable or suspend organization access to platform workspace."
								/>
							)}
						</form.AppField>
					</div>
				</form.AppForm>
			</FormDialog>

			<ViewDialog
				presentation={presentation}
				open={isViewOpen}
				onOpenChange={(next) => {
					if (!next) onCloseView();
				}}
				title={customer.name}
				description={`Customer ID: ${customer.id}`}
				badge={
					<Badge
						variant="outline"
						className={`${SHOWCASE_ACCENT_CLASSES.successBorder} text-[10px] ${SHOWCASE_ACCENT_CLASSES.successText}`}
					>
						ACTIVE ENTERPRISE
					</Badge>
				}
				size="lg"
				breadcrumbs={[
					{ label: "Dashboard", href: "/" },
					{ label: "Customers", href: "/customers" },
					{ label: customer.name, active: true },
				]}
				backTo={onCloseView}
				backLabel="Return to showcase"
				onEdit={() => {
					onCloseView();
					onOpenEdit(customer.id);
				}}
				editText="Edit Customer"
				closeText="Close View"
			>
				<SchemaRenderer schema={CUSTOMER_INFOLIST_SCHEMA} record={customer} mode="view" />
			</ViewDialog>
		</>
	);
}
