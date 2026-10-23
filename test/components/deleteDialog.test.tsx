import { describe, expect, it, vi } from "vitest";

import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { renderWithProviders, screen } from "test/test-utils";

function renderBatchDelete(locale: "en" | "zh") {
  return renderWithProviders(
    <DeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} entityName="Category" itemCount={3} />,
    { locale },
  );
}

describe("DeleteDialog batch copy", () => {
  it("names the entity type in the confirmation title and description (en)", () => {
    renderBatchDelete("en");

    expect(screen.getByRole("alertdialog")).toHaveTextContent("Delete 3 Category");
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Are you sure you want to delete 3 selected Category? This action cannot be undone.",
    );
  });

  it("names the entity type in the confirmation title and description (zh)", () => {
    renderBatchDelete("zh");

    expect(screen.getByRole("alertdialog")).toHaveTextContent("批量删除 3 项 Category");
    expect(screen.getByRole("alertdialog")).toHaveTextContent("确定要删除选中的 3 项 Category吗？此操作无法撤销。");
  });
});
