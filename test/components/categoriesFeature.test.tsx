import { describe, expect, it } from "vitest";

import { CategoriesListView, categoryUI } from "@/features/categories/ui";
import { AccessControlProvider } from "@/lib/resource";
import { fireEvent, renderWithProviders, screen } from "test/test-utils";

describe("Categories Feature Tests", () => {
  it("exposes declarative categoryUI config with table columns, batch actions and form fields", () => {
    expect(categoryUI.resource.name).toBe("categories");
    expect(categoryUI.config.table.exportFileName).toBe("categories-catalog.csv");
    expect(categoryUI.config.table.batchActions).toHaveLength(1);
    expect(categoryUI.config.form?.fields).toHaveLength(3);
  });

  it("renders CategoriesListView header, create button and MSW-backed rows", async () => {
    renderWithProviders(<CategoriesListView />);

    expect(await screen.findByText("分类目录")).toBeInTheDocument();
    const createBtn = await screen.findByRole("button", { name: /新增分类/ });
    expect(createBtn).toBeInTheDocument();

    // Clicking create opens declarative ResourceFormSchemaRenderer dialog
    fireEvent.click(createBtn);
    expect(await screen.findByLabelText(/^分类名称/)).toBeInTheDocument();
  });

  it("hides create button when AccessControlProvider denies create permission", async () => {
    renderWithProviders(
      <AccessControlProvider evaluator={({ action }) => action !== "create"}>
        <CategoriesListView />
      </AccessControlProvider>,
    );

    expect(await screen.findByText("分类目录")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /新增分类/ })).toBeNull();
  });
});
