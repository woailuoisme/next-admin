import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { server } from "@/mocks/server";

vi.mock("@/components/ui/map", () => ({
	useMap: () => ({ map: null, isLoaded: true, resolvedTheme: "light" }),
	Map: ({ children }: { children?: ReactNode }) => <div data-testid="mock-schema-map">{children}</div>,
	MapControls: () => <div data-testid="mock-schema-map-controls" />,
	MapMarker: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	MarkerContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
	MarkerPopup: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

import {
	connectField,
	Form,
	type FormFieldRenderProps,
	useAppForm,
	useTypedAppFormContext,
	withFieldGroup,
	withForm,
} from "@/components/form";
import { s, SchemaRenderer } from "@/components/schema";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

const profileSchema = z.object({
	fullName: z.string().min(2, "Name too short"),
	notifyByEmail: z.boolean(),
});

const NotificationSection = withForm({
	defaultValues: {
		fullName: "",
		notifyByEmail: false,
	},
	props: {
		heading: "Notifications",
	},
	render: ({ form, heading }) => (
		<section aria-label={heading}>
			<form.AppField name="notifyByEmail">
				{(field) => <field.CheckboxInput label="Email Notifications" />}
			</form.AppField>
		</section>
	),
});

const AddressFieldGroup = withFieldGroup({
	defaultValues: { city: "", zip: "" },
	render: ({ group }) => (
		<div>
			<group.AppField name="city">{(field) => <field.TextInput label="City" />}</group.AppField>
			<group.AppField name="zip">{(field) => <field.TextInput label="Postal Code" />}</group.AppField>
		</div>
	),
});

function TypedResetButton() {
	const form = useTypedAppFormContext();
	return (
		<button type="button" onClick={() => form.reset()}>
			Clear via Context
		</button>
	);
}

describe("TanStack Form v1 useAppForm & Unified FormSchemaRenderer", () => {
	it("supports withFieldGroup nested path mapping and useTypedAppFormContext", async () => {
		const onSubmit = vi.fn();

		function GroupHarness() {
			const form = useAppForm({
				defaultValues: { shippingCity: "Tokyo", shippingZip: "100-0001" },
				onSubmit: ({ value }) => onSubmit(value),
			});

			return (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
				>
					<form.AppForm>
						<AddressFieldGroup form={form} fields={{ city: "shippingCity", zip: "shippingZip" }} />
						<TypedResetButton />
						<form.SubmitButton label="Submit Address" />
					</form.AppForm>
				</form>
			);
		}

		const { user } = renderWithProviders(<GroupHarness />);
		const cityInput = screen.getByLabelText("City") as HTMLInputElement;
		expect(cityInput.value).toBe("Tokyo");

		fireEvent.change(cityInput, { target: { value: "Osaka" } });
		await user.click(screen.getByRole("button", { name: "Submit Address" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith({ shippingCity: "Osaka", shippingZip: "100-0001" });
		});

		await user.click(screen.getByRole("button", { name: "Clear via Context" }));
		expect(cityInput.value).toBe("Tokyo");
	});
	it("supports useAppForm, AppField, withForm and SubmitButton with Zod validation", async () => {
		const onValidSubmit = vi.fn();

		function AppFormHarness() {
			const form = useAppForm({
				defaultValues: {
					fullName: "",
					notifyByEmail: false,
				},
				validators: { onSubmit: profileSchema },
				onSubmit: ({ value }) => onValidSubmit(value),
			});

			return (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
				>
					<form.AppForm>
						<form.AppField name="fullName">{(field) => <field.TextInput label="Full Name" required />}</form.AppField>

						<NotificationSection form={form} heading="Alert Preferences" />

						<form.SubmitButton label="Save Profile" />
					</form.AppForm>
				</form>
			);
		}

		const { user } = renderWithProviders(<AppFormHarness />);

		await user.click(screen.getByRole("button", { name: "Save Profile" }));
		expect(await screen.findByText("Name too short")).toBeInTheDocument();
		expect(onValidSubmit).not.toHaveBeenCalled();

		const nameInput = screen.getByLabelText(/^Full Name/);
		fireEvent.change(nameInput, { target: { value: "Ada Lovelace" } });
		await user.click(screen.getByRole("checkbox", { name: "Email Notifications" }));
		await user.click(screen.getByRole("button", { name: "Save Profile" }));

		await waitFor(() => {
			expect(onValidSubmit).toHaveBeenCalledWith({
				fullName: "Ada Lovelace",
				notifyByEmail: true,
			});
		});
	});

	it("renders section/grid schema nodes and evaluates visibleWhen & disabledWhen reactively", async () => {
		function SchemaHarness() {
			const form = useAppForm({
				defaultValues: {
					enableShipping: false,
					carrierCode: "",
					weightKg: 1,
					lockWeight: false,
				},
				onSubmit: async () => undefined,
			});

			return (
				<Form form={form} as="div">
					<SchemaRenderer
						form={form}
						schema={[
							{
								type: "section",
								title: "Fulfillment Settings",
								columns: 2,
								schema: [
									{
										type: "switch",
										name: "enableShipping",
										label: "Requires Shipping",
									},
									{
										type: "checkbox",
										name: "lockWeight",
										label: "Lock Package Weight",
									},
								],
							},
							{
								type: "grid",
								key: "shipping-details-grid",
								columns: 2,
								visibleWhen: ({ values }) => Boolean(values.enableShipping),
								schema: [
									{
										type: "text",
										name: "carrierCode",
										label: "Carrier Code",
										placeholder: "DHL / UPS",
									},
									{
										type: "number",
										name: "weightKg",
										label: "Package Weight",
										disabledWhen: ({ values }) => Boolean(values.lockWeight),
									},
								],
							},
						]}
					/>
				</Form>
			);
		}

		const { user } = renderWithProviders(<SchemaHarness />);

		expect(screen.getByText("Fulfillment Settings")).toBeInTheDocument();
		expect(screen.queryByPlaceholderText("DHL / UPS")).toBeNull();

		await user.click(screen.getByRole("switch"));
		expect(await screen.findByPlaceholderText("DHL / UPS")).toBeInTheDocument();

		const weightInput = screen.getByRole("spinbutton");
		expect(weightInput).not.toBeDisabled();

		await user.click(screen.getByRole("checkbox", { name: "Lock Package Weight" }));
		await waitFor(() => {
			expect(screen.getByRole("spinbutton")).toBeDisabled();
		});
	});

	it("supports s.* builder for tabs, fieldset, extended fields (radio, masked, tags, currency, combobox), and infolist entries", async () => {
		function UnifiedSchemaHarness() {
			const form = useAppForm({
				defaultValues: {
					plan: "pro",
					phone: "",
					tags: ["vip"],
					budget: 1200,
					country: "us",
				},
				onSubmit: async () => undefined,
			});

			const auditRecord = {
				createdBy: "admin@acme.dev",
				status: "approved",
				amount: 4200,
			};

			return (
				<Form form={form} as="div">
					<SchemaRenderer
						form={form}
						record={auditRecord}
						schema={[
							s.tabs({
								tabs: [
									{
										value: "fields",
										label: "Fields",
										schema: [
											s.fieldset({
												legend: "Billing & Contact",
												columns: 2,
												schema: [
													s.radio("plan", {
														label: "Plan",
														direction: "horizontal",
														options: [
															{ label: "Pro", value: "pro" },
															{ label: "Team", value: "team" },
														],
													}),
													s.masked("phone", {
														label: "Phone Mask",
														mask: "(999) 999-9999",
													}),
													s.tags("tags", {
														label: "Labels",
														placeholder: "Add tag",
													}),
													s.currency("budget", {
														label: "Monthly Budget",
														currency: "USD",
													}),
													s.combobox("country", {
														label: "Country",
														options: [
															{ label: "United States", value: "us" },
															{ label: "Japan", value: "jp" },
														],
													}),
												],
											}),
											s.entry.badge("status", {
												label: "Review Status",
												colorMap: { approved: "success" },
												labelMap: { approved: "Approved" },
											}),
											s.entry.callout({
												color: "info",
												title: "Audit Trail",
												description: "Managed by Unified Schema",
											}),
										],
									},
									{
										value: "audit",
										label: "Audit",
										schema: [
											s.entry.text("createdBy", { label: "Created By" }),
											s.entry.currency("amount", { label: "Contract Value", currency: "USD" }),
										],
									},
								],
							}),
						]}
					/>
				</Form>
			);
		}

		const { user } = renderWithProviders(<UnifiedSchemaHarness />);

		expect(screen.getByText("Billing & Contact")).toBeInTheDocument();
		expect(screen.getByText("Approved")).toBeInTheDocument();
		expect(screen.getByText("Audit Trail")).toBeInTheDocument();
		expect(screen.getByText("vip")).toBeInTheDocument();

		await user.click(screen.getByRole("tab", { name: "Audit" }));
		expect(await screen.findByText("admin@acme.dev")).toBeInTheDocument();
	});

	it("connectField wires standalone uncontrolled and AppForm-bound controls seamlessly", async () => {
		function ProbeControl({
			id,
			value,
			onChange,
			hasError,
			suffixTag,
		}: FormFieldRenderProps<string> & { suffixTag?: string }) {
			return (
				<div>
					<input id={id} aria-invalid={hasError} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
					{suffixTag ? <span>{suffixTag}</span> : null}
				</div>
			);
		}

		const ProbeInput = connectField<string, { suffixTag?: string }>(ProbeControl, {
			defaultValue: "init-val",
		});

		const onStandaloneChange = vi.fn();
		renderWithProviders(<ProbeInput label="Standalone Probe" suffixTag="tag-ok" onChange={onStandaloneChange} />);
		const standalone = screen.getByLabelText("Standalone Probe") as HTMLInputElement;
		expect(standalone.value).toBe("init-val");
		expect(screen.getByText("tag-ok")).toBeInTheDocument();
		fireEvent.change(standalone, { target: { value: "updated-standalone" } });
		expect(onStandaloneChange).toHaveBeenCalledWith("updated-standalone");

		const onBoundSubmit = vi.fn();
		function BoundHarness() {
			const form = useAppForm({
				defaultValues: { token: "seed" },
				onSubmit: ({ value }) => onBoundSubmit(value),
			});
			return (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void form.handleSubmit();
					}}
				>
					<form.AppForm>
						<ProbeInput name="token" form={form} label="Bound Probe" />
						<form.SubmitButton label="Submit Probe" />
					</form.AppForm>
				</form>
			);
		}

		const { user } = renderWithProviders(<BoundHarness />);
		const bound = screen.getByLabelText("Bound Probe") as HTMLInputElement;
		expect(bound.value).toBe("seed");
		fireEvent.change(bound, { target: { value: "bound-next" } });
		await user.click(screen.getByRole("button", { name: "Submit Probe" }));
		await waitFor(() => {
			expect(onBoundSubmit).toHaveBeenCalledWith({ token: "bound-next" });
		});
	});

	it("supports extended useAppForm fields and s.* schema parity nodes", async () => {
		const onSubmit = vi.fn();

		function ParityHarness() {
			const form = useAppForm({
				defaultValues: {
					secret: "",
					volume: 40,
					score: 3,
					align: "left",
					features: ["fast"],
					env: { MODE: "prod" },
					items: [{ title: "Alpha" }],
					startTime: "09:30",
					pin: "",
				},
				onSubmit: ({ value }) => onSubmit(value),
			});

			return (
				<Form form={form} as="form">
					<form.AppForm>
						<form.AppField name="secret">{(field) => <field.PasswordInput label="API Secret" />}</form.AppField>
						<SchemaRenderer
							form={form}
							schema={[
								s.slider("volume", { label: "Volume Level", min: 0, max: 100 }),
								s.rating("score", { label: "Quality Score", max: 5 }),
								s.toggleButtons("align", {
									label: "Alignment",
									options: [
										{ label: "Left", value: "left" },
										{ label: "Center", value: "center" },
									],
								}),
								s.checkboxGroup("features", {
									label: "Features",
									options: [
										{ label: "Fast", value: "fast" },
										{ label: "Safe", value: "safe" },
									],
								}),
								s.keyValue("env", { label: "Environment" }),
								s.repeater("items", {
									label: "Line Items",
									createItem: () => ({ title: "New Item" }),
									renderItem: (item: { title: string }) => <span>{item.title}</span>,
								}),
								s.time("startTime", { label: "Start Time" }),
								s.otp("pin", { label: "Verification PIN", length: 4 }),
							]}
						/>
						<form.SubmitButton label="Submit Parity" />
					</form.AppForm>
				</Form>
			);
		}

		const { user } = renderWithProviders(<ParityHarness />);

		const secretInput = screen.getByLabelText("API Secret");
		fireEvent.change(secretInput, { target: { value: "s3cr3t!" } });

		expect(screen.getByText("40")).toBeInTheDocument();
		await user.click(screen.getByText("Center"));
		await user.click(screen.getByRole("checkbox", { name: "Safe" }));
		expect(await screen.findByDisplayValue("MODE")).toBeInTheDocument();
		expect(screen.getByDisplayValue("prod")).toBeInTheDocument();
		expect(screen.getByText("Alpha")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Submit Parity" }));
		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					secret: "s3cr3t!",
					volume: 40,
					align: "center",
					features: ["fast", "safe"],
					env: { MODE: "prod" },
					items: [{ title: "Alpha" }],
					startTime: "09:30",
				}),
			);
		});
	});

	it("renders extended s.color, s.dateRange, s.file, s.richEditor, s.cascader, s.treeSelect and s.location nodes", async () => {
		server.use(http.get("*/api/geocode", () => HttpResponse.json({ configured: false })));

		function ExtendedNodesHarness() {
			const form = useAppForm({
				defaultValues: {
					brandColor: "#2563eb",
					campaignWindow: { from: "2026-01-01", to: "2026-01-10" },
					attachments: [],
					bio: "<p>Rich bio</p>",
					region: ["cn", "bj"],
					department: "fe",
					coords: { lng: 116.397, lat: 39.908 },
				},
				onSubmit: async () => undefined,
			});

			return (
				<Form form={form} as="div">
					<SchemaRenderer
						form={form}
						schema={[
							s.color("brandColor", { label: "Brand Color" }),
							s.dateRange("campaignWindow", { label: "Campaign Window" }),
							s.file("attachments", { label: "Attachments" }),
							s.richEditor("bio", { label: "Rich Bio" }),
							s.cascader("region", {
								label: "Region Cascader",
								cascaderOptions: [{ value: "cn", label: "China", children: [{ value: "bj", label: "Beijing" }] }],
							}),
							s.treeSelect("department", {
								label: "Department Tree",
								treeData: [{ value: "eng", label: "Engineering", children: [{ value: "fe", label: "Frontend" }] }],
							}),
							s.location("coords", { label: "Store Location" }),
						]}
					/>
				</Form>
			);
		}

		renderWithProviders(<ExtendedNodesHarness />);

		expect(screen.getByText("Campaign Window")).toBeInTheDocument();
		expect(screen.getByText("2026-01-01 ~ 2026-01-10")).toBeInTheDocument();

		expect(await screen.findByText("Region Cascader")).toBeInTheDocument();
		expect(await screen.findByText("China / Beijing")).toBeInTheDocument();
		expect(await screen.findByText("Department Tree")).toBeInTheDocument();
		expect(await screen.findByText("Frontend")).toBeInTheDocument();
		expect(await screen.findByText("Brand Color")).toBeInTheDocument();
		expect(await screen.findByText("#2563EB")).toBeInTheDocument();
		expect(await screen.findByText("Attachments")).toBeInTheDocument();
		expect(await screen.findByText("Rich Bio")).toBeInTheDocument();
		expect(await screen.findByText("Store Location")).toBeInTheDocument();
		expect(await screen.findByTestId("mock-schema-map")).toBeInTheDocument();
	});
});
