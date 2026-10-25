import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CodeEntry,
  ColorEntry,
  IconEntry,
  ImageEntry,
  Infolist,
  InfolistCallout,
  InfolistFieldset,
  InfolistGrid,
  InfolistSection,
  KeyValueEntry,
  RepeatableEntry,
  TextEntry,
} from "@/components/infolist";
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

  it("formats text as badge, currency, and link", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <TextEntry name="tier" label="Membership" format="badge" color="primary" />
        <TextEntry name="balance" label="Account Balance" format="currency" currency="USD" />
        <TextEntry name="profile.email" label="Contact" format="url" href="https://example.com" />
      </Infolist>,
    );

    // Badge formatting
    const badge = screen.getByText("Enterprise");
    expect(badge).toBeInTheDocument();
    expect(badge.closest("[data-slot='badge']")).toBeInTheDocument();

    // Currency formatting
    expect(screen.getByText(/\$4,500\.50/)).toBeInTheDocument();

    // Link formatting
    const link = screen.getByRole("link", { name: /alex@example\.com/i });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders IconEntry for boolean state with appropriate text", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <IconEntry name="verified" label="Identity Verified" text="Verified Business" />
      </Infolist>,
    );

    expect(screen.getByText("Identity Verified")).toBeInTheDocument();
    expect(screen.getByText("Verified Business")).toBeInTheDocument();
  });

  it("renders ColorEntry with swatch and hex string", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <ColorEntry name="themeColor" label="Brand Color" />
      </Infolist>,
    );

    expect(screen.getByText("Brand Color")).toBeInTheDocument();
    expect(screen.getByText("#3B82F6")).toBeInTheDocument();
  });

  it("renders CodeEntry with formatted JSON", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <CodeEntry name="meta" label="Metadata" language="json" />
      </Infolist>,
    );

    expect(screen.getByText("Metadata")).toBeInTheDocument();
    expect(screen.getByText(/ap-northeast/)).toBeInTheDocument();
    expect(screen.getByText(/production/)).toBeInTheDocument();
  });

  it("renders KeyValueEntry in list and table variants", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <KeyValueEntry name="meta" label="Config List" variant="list" />
        <KeyValueEntry name="meta" label="Config Table" variant="table" />
      </Infolist>,
    );

    expect(screen.getByText("Config List")).toBeInTheDocument();
    expect(screen.getByText("Config Table")).toBeInTheDocument();
    expect(screen.getAllByText("ap-northeast").length).toBe(2);
  });

  it("renders RepeatableEntry with card layout and toggles collapse", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <RepeatableEntry name="projects" label="Assigned Projects" collapsible itemTitle={(item) => item.name}>
          {(item) => <div data-testid={`project-item-${item.id}`}>{item.status}</div>}
        </RepeatableEntry>
      </Infolist>,
    );

    expect(screen.getByText("Assigned Projects")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByTestId("project-item-p1")).toHaveTextContent("Active");

    // Toggle collapse
    const collapseTriggers = screen.getAllByRole("button", { name: /收起|collapse/i });
    fireEvent.click(collapseTriggers[0]);
    expect(screen.queryByTestId("project-item-p1")).not.toBeInTheDocument();
    expect(screen.getByTestId("project-item-p2")).toBeInTheDocument();
  });

  it("renders InfolistCallout with title, description, actions, and dismisses", () => {
    const handleAction = vi.fn();
    const handleDismiss = vi.fn();

    renderWithProviders(
      <InfolistCallout
        title="Security Notice"
        description="Password expires in 3 days."
        color="warning"
        dismissible
        onDismiss={handleDismiss}
        actions={[{ label: "Update Password", onClick: handleAction }]}
      />,
    );

    expect(screen.getByText("Security Notice")).toBeInTheDocument();
    expect(screen.getByText("Password expires in 3 days.")).toBeInTheDocument();

    const actionBtn = screen.getByRole("button", { name: "Update Password" });
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalled();

    const dismissBtn = screen.getByRole("button", { name: /close|关闭/i });
    fireEvent.click(dismissBtn);
    expect(handleDismiss).toHaveBeenCalled();
    expect(screen.queryByText("Security Notice")).not.toBeInTheDocument();
  });

  it("renders ImageEntry with thumbnails", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <ImageEntry name="avatar" label="Profile Avatar" alt="User Avatar" />
      </Infolist>,
    );

    expect(screen.getByText("Profile Avatar")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "User Avatar 1" })).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("renders InfolistFieldset and InfolistGrid with responsive columns", () => {
    renderWithProviders(
      <Infolist record={sampleRecord}>
        <InfolistFieldset legend="Account Summary" description="Core properties">
          <InfolistGrid columns={2}>
            <TextEntry name="id" label="ID" />
            <TextEntry name="tier" label="Tier" />
          </InfolistGrid>
        </InfolistFieldset>
      </Infolist>,
    );

    expect(screen.getByText("Account Summary")).toBeInTheDocument();
    expect(screen.getByText("Core properties")).toBeInTheDocument();
    expect(screen.getByText("usr_1001")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders InfolistSection in card mode and toggles collapsible state", () => {
    renderWithProviders(
      <InfolistSection title="User Settings" collapsible defaultCollapsed={false}>
        <div data-testid="section-content">Sensitive Settings</div>
      </InfolistSection>,
    );

    expect(screen.getByText("User Settings")).toBeInTheDocument();
    expect(screen.getByTestId("section-content")).toBeInTheDocument();

    const toggleBtn = screen.getByRole("button", { name: /收起|collapse/i });
    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId("section-content")).not.toBeInTheDocument();
  });
});
