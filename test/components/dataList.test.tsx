import { describe, expect, it } from "vitest";

import { DataList } from "@/components/dialogs/DataList";
import { renderWithProviders, screen } from "test/test-utils";

describe("DataList", () => {
  it("renders items with preserved grid breakpoints, copy button, badge, and null fallback", () => {
    const { container } = renderWithProviders(
      <DataList
        columns={2}
        items={[
          { label: "Email", value: "team@example.com", copyable: true },
          { label: "Status", value: "Paid", badge: true },
          { label: "Retries", value: 0, copyable: true },
          { label: "Notes", value: null, span: 2 },
        ]}
      />,
      { locale: "en" },
    );

    const gridEl = container.querySelector(".grid");
    expect(gridEl).toHaveClass("sm:grid-cols-2", "gap-3");
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("team@example.com")).toBeInTheDocument();
    expect(screen.getByText("Paid").closest("[data-slot='badge']")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Click to copy" })).toHaveLength(2);
  });
});
