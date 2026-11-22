import { describe, expect, it, vi } from "vitest";

import { FullscreenToggle } from "@/components/dialogs/FullscreenToggle";
import { PageHeader } from "@/components/dialogs/PageHeader";
import { renderWithProviders, screen } from "test/test-utils";

describe("Dialogs & resource chrome i18n", () => {
	it("localizes FullscreenToggle", () => {
		const zh = renderWithProviders(<FullscreenToggle isFullscreen={false} onToggle={vi.fn()} />);
		expect(screen.getByRole("button", { name: "进入全屏" })).toBeInTheDocument();
		zh.unmount();

		renderWithProviders(<FullscreenToggle isFullscreen={false} onToggle={vi.fn()} />, { locale: "en" });
		expect(screen.getByRole("button", { name: "Enter Fullscreen" })).toBeInTheDocument();
	});

	it("localizes the PageHeader back button", () => {
		const zh = renderWithProviders(<PageHeader title="用户管理" backTo="/users" />);
		expect(screen.getByRole("button", { name: "返回" })).toBeInTheDocument();
		zh.unmount();

		renderWithProviders(<PageHeader title="User Management" backTo="/users" />, { locale: "en" });
		expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
	});

	it("keeps the explicit backLabel prop authoritative", () => {
		renderWithProviders(<PageHeader title="User Management" backTo="/users" backLabel="Return to List" />);
		expect(screen.getByRole("button", { name: "Return to List" })).toBeInTheDocument();
	});
});
