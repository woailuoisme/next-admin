import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

describe("NotificationsPage", () => {
	beforeEach(() => {
		window.localStorage.clear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("renders MSW notifications, filters by unread/search, and batch marks selected as read", async () => {
		const { user } = renderWithProviders(<NotificationsPage />, { locale: "en" });

		expect(await screen.findByText("Notification Center")).toBeInTheDocument();
		// Wait for MSW-backed notification items to load
		await waitFor(() => {
			expect(screen.queryAllByRole("checkbox").length).toBeGreaterThan(1);
		});

		// Toggle Unread only
		const unreadSwitch = screen.getByRole("switch", { name: "Unread only" });
		await user.click(unreadSwitch);
		expect(unreadSwitch).toBeChecked();

		// Search filter with no matches shows empty state and Clear filters button
		const searchInput = screen.getByPlaceholderText("Search notification title or description...");
		await user.type(searchInput, "non-existent-notification-xyz");
		expect(await screen.findByText("No notifications match your current search or filters")).toBeInTheDocument();

		const clearButtons = screen.getAllByRole("button", { name: "Clear filters" });
		await user.click(clearButtons[clearButtons.length - 1]);
		expect(searchInput).toHaveValue("");

		// Switch to Customers tab and verify filtering works
		const customersTab = screen.getByRole("tab", { name: /Customers/i });
		await user.click(customersTab);
		expect(customersTab).toHaveAttribute("aria-selected", "true");

		// Switch back to All tab and select all visible to batch mark as read
		await user.click(screen.getByRole("tab", { name: /All/i }));
		const selectAllCheckbox = screen.getByRole("checkbox", { name: "Select all" });
		await user.click(selectAllCheckbox);
		const batchReadBtn = await screen.findByRole("button", { name: "Mark read" });
		await user.click(batchReadBtn);

		await waitFor(() => {
			expect(screen.getByText("All caught up")).toBeInTheDocument();
		});
	});

	it("switches to Preferences tab and persists channel toggles", async () => {
		const { user } = renderWithProviders(<NotificationsPage />, { locale: "en" });

		const prefsTab = await screen.findByRole("tab", { name: "Preferences" });
		await user.click(prefsTab);

		expect(await screen.findByText("Notification Channels & Preferences")).toBeInTheDocument();
		const soundSwitch = screen.getByRole("switch", { name: "Notification sound" });
		expect(soundSwitch).toBeChecked();

		await user.click(soundSwitch);
		expect(soundSwitch).not.toBeChecked();

		const stored = JSON.parse(window.localStorage.getItem("next_admin_notification_preferences_v1") ?? "{}");
		expect(stored.soundEnabled).toBe(false);
	});

	it("supports single-row delete and batch delete confirmation dialog", async () => {
		const { user } = renderWithProviders(<NotificationsPage />, { locale: "en" });

		expect(await screen.findByText("Notification Center")).toBeInTheDocument();
		await waitFor(() => {
			expect(screen.getAllByRole("button", { name: "Delete" }).length).toBeGreaterThan(1);
		});

		const initialDeleteBtns = screen.getAllByRole("button", { name: "Delete" });
		const initialCount = initialDeleteBtns.length;
		await user.click(initialDeleteBtns[0]);

		await waitFor(() => {
			expect(screen.getAllByRole("button", { name: "Delete" }).length).toBe(initialCount - 1);
		});

		// Select all remaining items and batch delete via AlertDialog
		await user.click(screen.getByRole("checkbox", { name: "Select all" }));
		await user.click(await screen.findByRole("button", { name: "Delete selected" }));

		expect(await screen.findByText("Delete selected notifications?")).toBeInTheDocument();
		const confirmDeleteBtns = screen.getAllByRole("button", { name: "Delete selected" });
		await user.click(confirmDeleteBtns[confirmDeleteBtns.length - 1]);

		expect(await screen.findByText("No new notifications")).toBeInTheDocument();
	});
});
