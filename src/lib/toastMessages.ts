import { createNamespaceTranslator } from "@/i18n";

const getToastTranslator = () => createNamespaceTranslator("toast");

type ToastTranslator = ReturnType<typeof getToastTranslator>;
type ToastKey = Parameters<ToastTranslator>[0];
type ToastValues = Parameters<ToastTranslator>[1];

const translate = (key: ToastKey, values?: ToastValues) => getToastTranslator()(key, values);

/**
 * Centralized toast message helpers for non-React contexts or direct calls.
 * Powered by next-intl createTranslator.
 */
export const toastMessages = {
  // Generic CRUD
  created: (name: string) => translate("created", { name }),
  updated: (name: string) => translate("updated", { name }),
  deleted: () => translate("deleted"),
  createError: () => translate("create_error"),
  updateError: () => translate("update_error"),
  deleteError: () => translate("delete_error"),

  // Status change (Order / User)
  statusChanged: (subject: string, status: string) => translate("status_changed", { subject, status }),
  statusError: () => translate("status_error"),

  // Auth
  loginSuccess: (name: string) => translate("login_success", { name }),
  loginError: () => translate("login_error"),
  logoutInfo: () => translate("logout_info"),

  // Notifications
  allNotificationsRead: () => translate("all_notifications_read"),
  allNotificationsReadError: () => translate("all_notifications_read_error"),
};
