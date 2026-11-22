import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { clearAuthSession, setAuthSession, useAuthStore } from "@/features/auth/store";
import { usePreferencesStore } from "@/stores/preferences";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

describe("ProfilePage", () => {
	beforeEach(() => {
		setAuthSession({
			token: "mock-token-admin-1-123456",
			admin: {
				id: "admin-1",
				name: "Alex Morgan",
				email: "admin@nextadmin.io",
				avatarUrl: "https://example.com/initial.png",
				role: "superadmin",
				status: "active",
				createdAt: "2026-01-15T08:00:00Z",
				lastActiveAt: "2026-11-20T08:00:00Z",
			},
		});
	});

	afterEach(() => {
		clearAuthSession();
		vi.restoreAllMocks();
	});

	it("renders identity summary and updates display name via MSW PATCH /v1/auth/me", async () => {
		const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

		expect(screen.getByText("Profile & Account")).toBeInTheDocument();
		expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
		expect(screen.getByText("admin@nextadmin.io")).toBeInTheDocument();

		const nameInput = screen.getByLabelText(/Display Name/, { selector: "input" });
		await user.clear(nameInput);
		await user.type(nameInput, "Jordan Lee");
		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		await waitFor(() => {
			expect(useAuthStore.getState().session?.admin.name).toBe("Jordan Lee");
		});
		expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
	});

	it("clears an existing avatarUrl when submitted empty", async () => {
		const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

		const avatarInput = screen.getByLabelText(/Avatar URL/, { selector: "input" });
		expect(avatarInput).toHaveValue("https://example.com/initial.png");

		await user.clear(avatarInput);
		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		await waitFor(() => {
			expect(useAuthStore.getState().session?.admin.avatarUrl).toBeUndefined();
		});
	});

	it("blocks unsafe javascript: protocol in avatarUrl", async () => {
		const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

		const avatarInput = screen.getByLabelText(/Avatar URL/, { selector: "input" });
		await user.clear(avatarInput);
		expect(avatarInput).toHaveValue("");
		await user.type(avatarInput, "javascript:alert(1)");
		expect(avatarInput).toHaveValue("javascript:alert(1)");
		await user.click(screen.getByRole("button", { name: "Save Changes" }));

		expect(await screen.findByText("Enter a valid http(s) or relative avatar URL")).toBeInTheDocument();
	});

	it("shows server error alert on wrong current password and submits valid change on Security tab", async () => {
		const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

		await user.click(screen.getByRole("tab", { name: "Security & Password" }));
		expect(await screen.findByText("Change Password")).toBeInTheDocument();

		const currentPwdInput = screen.getByLabelText(/Current Password/, { selector: "input" });
		const newPwdInput = screen.getByLabelText(/^New Password/, { selector: "input" });
		const confirmPwdInput = screen.getByLabelText(/Confirm New Password/, { selector: "input" });

		await user.type(currentPwdInput, "wrong-pass");
		await user.type(newPwdInput, "NewPass#2026");
		await user.type(confirmPwdInput, "NewPass#2026");
		await user.click(screen.getByRole("button", { name: "Update Password" }));

		expect(await screen.findByRole("alert")).toHaveTextContent("Current password is incorrect");

		await user.clear(currentPwdInput);
		await user.type(currentPwdInput, "admin123");
		await user.click(screen.getByRole("button", { name: "Update Password" }));

		await waitFor(() => {
			expect(currentPwdInput).toHaveValue("");
		});
	});

	it("updates workspace appearance mode on Preferences tab", async () => {
		const { user } = renderWithProviders(<ProfilePage />, { locale: "en" });

		await user.click(screen.getByRole("tab", { name: "Preferences" }));
		expect(await screen.findByText("Workspace Appearance & Preferences")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Dark" }));
		expect(usePreferencesStore.getState().mode).toBe("dark");
	});
});
