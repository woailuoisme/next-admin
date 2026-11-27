import { fireEvent } from "@testing-library/react";
import { ShieldCheck } from "lucide-react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Infolist, getNestedValue } from "@/components/infolist";
import { InfolistCallout } from "@/components/infolist/callout/InfolistCallout";
import { ActionSelectEntry } from "@/components/infolist/entries/ActionSelectEntry";
import { CodeEntry } from "@/components/infolist/entries/CodeEntry";
import { ColorEntry } from "@/components/infolist/entries/ColorEntry";
import { IconEntry } from "@/components/infolist/entries/IconEntry";
import { ImageEntry } from "@/components/infolist/entries/ImageEntry";
import { KeyValueEntry } from "@/components/infolist/entries/KeyValueEntry";
import { RepeatableEntry } from "@/components/infolist/entries/RepeatableEntry";
import { TextEntry } from "@/components/infolist/entries/TextEntry";
import { Fieldset, Grid, Section, Tabs } from "@/components/shared/layout";
import { renderWithProviders, screen } from "test/test-utils";

describe("Infolist Subsystem", () => {
	const sampleRecord = {
		id: "usr_1001",
		profile: {
			fullName: "Alex Morgan",
			email: "alex@example.com",
		},
		tier: "Enterprise",
		balance: 4500.5,
		themeColor: "#3b82f6",
		verified: true,
		avatar: "https://example.com/avatar.jpg",
		meta: {
			region: "ap-northeast",
			env: "production",
		},
		projects: [
			{ id: "p1", name: "Alpha", status: "Active" },
			{ id: "p2", name: "Beta", status: "Archived" },
		],
	};

	it("resolves nested values through Infolist context", () => {
		renderWithProviders(
			<Infolist record={sampleRecord}>
				<TextEntry name="profile.fullName" label="Full Name" />
				<TextEntry name="profile.email" label="Email" format="email" />
			</Infolist>,
		);

		expect(screen.getByText("Full Name")).toBeInTheDocument();
		expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
		expect(screen.getByText("Email")).toBeInTheDocument();
		expect(screen.getByText("alex@example.com")).toBeInTheDocument();
	});

	it("protects getNestedValue against prototype pollution and supports bracket indexing", () => {
		const data = [{ name: "First Item", nested: { code: 42 } }, { name: "Second Item" }];
		expect(getNestedValue(data, "[0].name")).toBe("First Item");
		expect(getNestedValue(data, "[0].nested.code")).toBe(42);
		expect(getNestedValue({ users: data }, "users[1].name")).toBe("Second Item");

		expect(getNestedValue(sampleRecord, "__proto__.polluted")).toBeUndefined();
		expect(getNestedValue(sampleRecord, "constructor.prototype")).toBeUndefined();
		expect(getNestedValue(sampleRecord, "id.length")).toBeUndefined();
		expect(getNestedValue(sampleRecord, "id.toString")).toBeUndefined();
		expect(getNestedValue(data, "length")).toBeUndefined();
	});

	it("isolates config context from record updates for memoized static children", () => {
		let staticRenderCount = 0;
		const StaticMemoChild = React.memo(function StaticMemoChild() {
			staticRenderCount += 1;
			return <div data-testid="static-memo-child">Static Block</div>;
		});

		const { rerender } = renderWithProviders(
			<Infolist record={{ name: "First" }}>
				<TextEntry name="name" label="Name" />
				<StaticMemoChild />
			</Infolist>,
		);

		expect(screen.getByText("First")).toBeInTheDocument();
		expect(staticRenderCount).toBe(1);

		rerender(
			<Infolist record={{ name: "Second" }}>
				<TextEntry name="name" label="Name" />
				<StaticMemoChild />
			</Infolist>,
		);

		expect(screen.getByText("Second")).toBeInTheDocument();
		expect(staticRenderCount).toBe(1);
	});

	it("formats text as badge, currency, and link", () => {
		renderWithProviders(
			<Infolist record={sampleRecord}>
				<TextEntry name="tier" label="Membership" format="badge" color="primary" />
				<TextEntry name="balance" label="Account Balance" format="currency" currency="USD" />
				<TextEntry name="profile.email" label="Contact" format="url" href="https://example.com" />
			</Infolist>,
		);

		const badge = screen.getByText("Enterprise");
		expect(badge).toBeInTheDocument();
		expect(badge.closest("[data-slot='badge']")).toBeInTheDocument();
		expect(screen.getByText(/\$4,500\.50/)).toBeInTheDocument();

		const link = screen.getByRole("link", { name: /alex@example\.com/i });
		expect(link).toHaveAttribute("href", "https://example.com");
	});

	it("sanitizes unsafe URLs and safely handles edge values in TextEntry", () => {
		renderWithProviders(
			<Infolist
				record={{
					evilUrl: "javascript:alert(1)",
					tabEvil: "java\tscript:alert(1)",
					inactive: false,
					blankNum: "   ",
					badCurrency: 99,
				}}
			>
				<TextEntry name="evilUrl" label="Evil Link" format="url" />
				<TextEntry name="tabEvil" label="Obfuscated Link" format="url" />
				<TextEntry name="inactive" label="Active Flag" />
				<TextEntry name="blankNum" label="Blank Number" format="number" />
				<TextEntry name="badCurrency" label="Bad Currency" format="currency" currency="INVALID_ISO" />
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.getByText("javascript:alert(1)")).toBeInTheDocument();
		expect(screen.getByText("No")).toBeInTheDocument();
		expect(screen.getByText("INVALID_ISO 99")).toBeInTheDocument();
	});

	it("renders IconEntry for boolean state with appropriate text and localized fallback", () => {
		renderWithProviders(
			<Infolist record={{ verified: true, suspended: false, empty: "" }}>
				<IconEntry name="verified" label="Identity Verified" text="Verified Business" />
				<IconEntry name="suspended" label="Suspended" />
				<IconEntry name="empty" label="Empty Icon" placeholder="--" />
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.getByText("Identity Verified")).toBeInTheDocument();
		expect(screen.getByText("Verified Business")).toBeInTheDocument();
		expect(screen.getByText("No")).toBeInTheDocument();
		expect(screen.getByText("--")).toBeInTheDocument();
	});

	it("renders ColorEntry preserving CSS functions and uppercasing hex", () => {
		renderWithProviders(
			<Infolist record={{ ...sampleRecord, oklchColor: "oklch(0.7 0.15 220)" }}>
				<ColorEntry name="themeColor" label="Brand Color" />
				<ColorEntry name="oklchColor" label="Token Color" />
			</Infolist>,
		);

		expect(screen.getByText("#3B82F6")).toBeInTheDocument();
		expect(screen.getByText("oklch(0.7 0.15 220)")).toBeInTheDocument();
	});

	it("renders CodeEntry safely even on circular references", () => {
		const circular: Record<string, unknown> = { env: "staging" };
		circular.self = circular;

		renderWithProviders(
			<Infolist record={{ ...sampleRecord, circular }}>
				<CodeEntry name="meta" label="Metadata" language="json" />
				<CodeEntry name="circular" label="Circular" language="json" />
			</Infolist>,
		);

		expect(screen.getByText(/ap-northeast/)).toBeInTheDocument();
		expect(screen.getByText(/production/)).toBeInTheDocument();
		expect(screen.getByText("[object Object]")).toBeInTheDocument();
	});

	it("renders KeyValueEntry in list and semantic table variants and skips null array items", () => {
		renderWithProviders(
			<Infolist
				record={{
					...sampleRecord,
					kvList: [null, { key: "region", value: "us-east-1" }, undefined],
				}}
			>
				<KeyValueEntry name="meta" label="Config List" variant="list" />
				<KeyValueEntry name="kvList" label="Config Table" variant="table" />
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.getByText("Config List")).toBeInTheDocument();
		expect(screen.getByText("Config Table")).toBeInTheDocument();
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Key" })).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
		expect(screen.getByText("us-east-1")).toBeInTheDocument();
	});

	it("renders RepeatableEntry in card and semantic table variants with accessible toggle", () => {
		renderWithProviders(
			<Infolist record={sampleRecord}>
				<RepeatableEntry name="projects" label="Assigned Projects" collapsible itemTitle={(item) => item.name}>
					{(item) => <div data-testid={`project-item-${item.id}`}>{item.status}</div>}
				</RepeatableEntry>
				<RepeatableEntry
					name="projects"
					label="Projects Table"
					variant="table"
					itemTitle={(item) => item.name}
					tableHeaders={["Project", "Status"]}
				>
					{(item) => <div>{item.status}</div>}
				</RepeatableEntry>
			</Infolist>,
		);

		expect(screen.getByText("Assigned Projects")).toBeInTheDocument();
		expect(screen.getByTestId("project-item-p1")).toHaveTextContent("Active");

		const alphaTrigger = screen.getByRole("button", { name: /Alpha\s+(收起|collapse)/i });
		expect(screen.getByRole("button", { name: /Beta\s+(收起|collapse)/i })).toBeInTheDocument();
		expect(alphaTrigger).toHaveAttribute("aria-expanded", "true");
		fireEvent.click(alphaTrigger);
		expect(alphaTrigger).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByTestId("project-item-p1")).not.toBeInTheDocument();
		expect(screen.getByTestId("project-item-p2")).toBeInTheDocument();

		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Project" })).toBeInTheDocument();
	});

	it("renders InfolistCallout with appropriate ARIA roles, safe action hrefs, and dismisses", () => {
		const handleAction = vi.fn();
		const handleDismiss = vi.fn();

		renderWithProviders(
			<>
				<InfolistCallout
					title="Security Notice"
					description="Password expires in 3 days."
					color="warning"
					dismissible
					onDismiss={handleDismiss}
					actions={[
						{ label: "Update Password", size: "xs", onClick: handleAction },
						{ label: "Unsafe Link", href: "javascript:alert(1)" },
					]}
				/>
				<InfolistCallout title="System Info" color="info" />
			</>,
		);

		expect(screen.getByRole("alert")).toHaveTextContent("Security Notice");
		expect(screen.getByRole("status")).toHaveTextContent("System Info");
		expect(screen.queryByRole("link", { name: "Unsafe Link" })).not.toBeInTheDocument();

		const actionBtn = screen.getByRole("button", { name: "Update Password" });
		fireEvent.click(actionBtn);
		expect(handleAction).toHaveBeenCalled();

		const dismissBtn = screen.getByRole("button", { name: /close|关闭/i });
		fireEvent.click(dismissBtn);
		expect(handleDismiss).toHaveBeenCalled();
		expect(screen.queryByText("Security Notice")).not.toBeInTheDocument();
	});

	it("renders ImageEntry cleanly for non-lightbox, broken image fallback, and filtered URLs", () => {
		renderWithProviders(
			<Infolist
				record={{
					avatar: "https://example.com/avatar.jpg",
					gallery: ["javascript:alert(1)", "https://example.com/1.jpg", "https://example.com/2.jpg"],
				}}
			>
				<ImageEntry name="avatar" label="Static Avatar" alt="User Avatar" lightbox={false} />
				<ImageEntry name="gallery" label="Gallery" alt="Photo" lightbox />
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.getByRole("img", { name: "User Avatar 1" })).toHaveAttribute("src", "https://example.com/avatar.jpg");
		// Static Avatar has lightbox={false}, only the 2 sanitized gallery images render trigger buttons
		const previewButtons = screen.getAllByRole("button", { name: /Preview image/i });
		expect(previewButtons).toHaveLength(2);

		const galleryImg = screen.getByRole("img", { name: "Photo 1" });
		fireEvent.error(galleryImg);
		expect(screen.getByText("No image")).toBeInTheDocument();
	});

	it("renders InfolistFieldset and InfolistGrid with responsive columns", () => {
		renderWithProviders(
			<Infolist record={sampleRecord}>
				<Fieldset legend="Account Summary" description="Core properties">
					<Grid columns={{ default: 1, lg: 5 }}>
						<TextEntry name="id" label="ID" />
						<TextEntry name="tier" label="Tier" />
					</Grid>
				</Fieldset>
			</Infolist>,
		);

		expect(screen.getByRole("group", { name: "Account Summary" })).toBeInTheDocument();
		expect(screen.getByText("Core properties")).toBeInTheDocument();
		expect(screen.getByText("usr_1001")).toBeInTheDocument();
		expect(screen.getByText("Enterprise")).toBeInTheDocument();
	});

	it("renders InfolistSection in card and plain modes including headerless collapsible state", () => {
		renderWithProviders(
			<>
				<Section title="User Settings" collapsible defaultCollapsed={false}>
					<div data-testid="section-content">Sensitive Settings</div>
				</Section>
				<Section collapsible defaultCollapsed card={false}>
					<div data-testid="headerless-content">Hidden Initially</div>
				</Section>
			</>,
		);

		expect(screen.getByTestId("section-content")).toBeInTheDocument();
		expect(screen.queryByTestId("headerless-content")).not.toBeInTheDocument();

		const collapseBtn = screen.getByRole("button", { name: /收起|collapse/i });
		fireEvent.click(collapseBtn);
		expect(screen.queryByTestId("section-content")).not.toBeInTheDocument();

		const expandBtns = screen.getAllByRole("button", { name: /展开区块|expand section/i });
		expect(expandBtns).toHaveLength(2);
		fireEvent.click(expandBtns[1]);
		expect(screen.getByTestId("headerless-content")).toBeInTheDocument();
	});

	it("handles InfolistTabs empty tabs and numeric zero badge safely", () => {
		renderWithProviders(
			<div data-testid="empty-tabs-host">
				<Tabs tabs={[]} />
			</div>,
		);
		expect(screen.getByTestId("empty-tabs-host")).toBeEmptyDOMElement();

		renderWithProviders(
			<Tabs
				tabs={[
					{ value: "one", label: "First Tab", badge: 0, children: <div>First Panel</div> },
					{ value: "two", label: "Second Tab", children: <div>Second Panel</div> },
				]}
			/>,
		);

		expect(screen.getByText("0").closest("[data-slot='badge']")).toBeInTheDocument();
		expect(screen.getByText("First Panel")).toBeInTheDocument();
	});

	it("renders InfolistSection content when collapsible={false} even with defaultCollapsed={true}", () => {
		renderWithProviders(
			<Section title="Static Card" collapsible={false} defaultCollapsed={true} card>
				<div data-testid="always-visible">Always Visible</div>
			</Section>,
		);

		expect(screen.getByTestId("always-visible")).toBeInTheDocument();
	});

	it("handles primitive ReactNode icons and blocked links safely in InfolistCallout", () => {
		renderWithProviders(
			<InfolistCallout
				title="Icon Node Test"
				icon="!"
				actions={[
					{ label: "Blocked", href: "javascript:alert(1)" },
					{ label: "Docs", href: "https://example.com", external: true },
				]}
			/>,
			{ locale: "en" },
		);

		expect(screen.getByText("!")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Blocked" })).toBeDisabled();
		expect(screen.getByRole("link", { name: /Docs.*Open in new tab/i })).toBeInTheDocument();
	});

	it("does not leak 'undefined' in IconEntry and supports href + focusable CodeEntry", () => {
		renderWithProviders(
			<Infolist record={{ code: "ORD-100", payload: { ok: true } }}>
				<IconEntry icon={ShieldCheck} label="Badge Only" />
				<TextEntry name="code" label="Order" href="/orders/100" openInNewTab={false} />
				<TextEntry label="Obj Fallback" value={{ foo: "bar" }} />
				<CodeEntry name="payload" label="JSON" language="json" />
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.queryByText("undefined")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "ORD-100" })).toHaveAttribute("href", "/orders/100");
		expect(screen.getByText('{"foo":"bar"}')).toBeInTheDocument();
		expect(screen.getByLabelText("json Code block")).toHaveAttribute("tabindex", "0");
	});

	it("guards IconEntry against prototype keys and renders ActionSelectEntry with Spinner without forced capitalize", () => {
		renderWithProviders(
			<Infolist record={{ protoKey: "toString" }}>
				<IconEntry
					name="protoKey"
					label="Prototype Guard"
					iconMap={{ active: ShieldCheck }}
					colorMap={{ active: "success" }}
				/>
				<ActionSelectEntry
					label="Runtime"
					value="iOS"
					options={[
						{ label: "iOS", value: "iOS" },
						{ label: "API v2", value: "API v2" },
					]}
					onChange={vi.fn()}
					isPending
					pendingText="Updating..."
				/>
			</Infolist>,
			{ locale: "en" },
		);

		expect(screen.getByText("toString")).toBeInTheDocument();
		const trigger = screen.getByRole("combobox");
		expect(trigger).not.toHaveClass("capitalize");
		expect(screen.getByRole("status")).toHaveTextContent("Updating...");
	});
});
