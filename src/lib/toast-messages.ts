import { m } from "@/i18n";

/**
 * Centralized toast message helpers.
 * All hooks should import from this file instead of calling m.* directly,
 * to keep toast message patterns consistent and easy to audit.
 */
export const toastMessages = {
  // Generic CRUD
  created: (name: string) => m.toast.created({ name }),
  updated: (name: string) => m.toast.updated({ name }),
  deleted: () => m.toast.deleted(),
  createError: () => m.toast.create_error(),
  updateError: () => m.toast.update_error(),
  deleteError: () => m.toast.delete_error(),

  // Status change (Order / User)
  statusChanged: (subject: string, status: string) => m.toast.status_changed({ subject, status }),
  statusError: () => m.toast.status_error(),

  // Staff-specific (includes role parameter)
  staffRegistered: (name: string, role: string) => m.toast.staff_registered({ name, role }),

  // Auth
  loginSuccess: (name: string) => m.toast.login_success({ name }),
  loginError: () => m.toast.login_error(),
  logoutInfo: () => m.toast.logout_info(),

  // Notifications
  allNotificationsRead: () => m.toast.all_notifications_read(),
  allNotificationsReadError: () => m.toast.all_notifications_read_error(),
};
