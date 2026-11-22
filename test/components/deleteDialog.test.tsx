import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { fireEvent, renderWithProviders, screen, waitFor } from "test/test-utils";

describe("ConfirmDialog", () => {
	it("renders title, description and keyword confirmation before unlocking confirm button", () => {
		renderWithProviders(
			<ConfirmDialog
				open
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
				title="Delete 3 Category"
				description="Are you sure you want to delete 3 selected Category?"
				confirmText="Delete"
				requireConfirmKeyword="DELETE"
			/>,
			{ locale: "en" },
		);

		expect(screen.getByRole("alertdialog")).toHaveTextContent("Delete 3 Category");
		expect(screen.getByRole("alertdialog")).toHaveTextContent("Are you sure you want to delete 3 selected Category?");

		const confirmBtn = screen.getByRole("button", { name: "Delete" });
		expect(confirmBtn).toBeDisabled();

		fireEvent.change(screen.getByRole("textbox"), { target: { value: "delete" } });
		expect(confirmBtn).not.toBeDisabled();
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

		renderWithProviders(
			<ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} confirmText="确认删除" />,
		);

		const confirmBtn = screen.getByRole("button", { name: "确认删除" });
		fireEvent.click(confirmBtn);
		fireEvent.click(confirmBtn);

		expect(onConfirm).toHaveBeenCalledTimes(1);
		resolveConfirm();
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});
});
