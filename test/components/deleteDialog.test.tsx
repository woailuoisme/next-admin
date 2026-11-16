import { describe, expect, it, vi } from "vitest";

import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

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

  it("ignores concurrent rapid clicks on confirm while onConfirm is in flight", async () => {
    let resolveConfirm!: () => void;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        }),
    );
    const onOpenChange = vi.fn();

    renderWithProviders(<DeleteDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} entityName="Category" />);

    const confirmBtn = screen.getByRole("button", { name: "确认删除" });
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    resolveConfirm();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
