import { Download } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { action } from "@/components/actions";
import { ActionsCell } from "@/components/data-table/cells/action/ActionsCell";
import { renderWithProviders, screen } from "test/test-utils";

const row = { id: "1" };

describe("ActionsCell label contract", () => {
	it("gives an unlabelled non-CRUD action a localized accessible name (en)", () => {
		renderWithProviders(
			<ActionsCell
				actions={[action.custom<{ id: string }>({ id: "custom-export", icon: Download, handler: vi.fn() })]}
				row={row}
			/>,
			{ locale: "en" },
		);

		expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
	});

	it("gives an unlabelled non-CRUD action a localized accessible name (zh)", () => {
		renderWithProviders(
			<ActionsCell
				actions={[action.custom<{ id: string }>({ id: "custom-export", icon: Download, handler: vi.fn() })]}
				row={row}
			/>,
			{ locale: "zh" },
		);

		expect(screen.getByRole("button", { name: "操作" })).toBeInTheDocument();
	});

	it("still resolves CRUD preset labels from the dictionary", () => {
		renderWithProviders(<ActionsCell actions={[action.view({ onExecute: vi.fn() })]} row={row} />, {
			locale: "en",
		});

		expect(screen.getByRole("button", { name: "View" })).toBeInTheDocument();
	});
});
