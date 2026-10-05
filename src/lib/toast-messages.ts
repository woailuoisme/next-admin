import { createTranslator, useTranslations } from "next-intl";

import { DICTIONARY, getUserLocale } from "@/i18n";

/**
 * React hook to access toast message helpers within components and hooks.
 */
export function useToastMessages() {
  const t = useTranslations("toast");

  return {
    created: (name: string) => t("created", { name }),
    updated: (name: string) => t("updated", { name }),
    deleted: () => t("deleted"),
    createError: () => t("create_error"),
    updateError: () => t("update_error"),
    deleteError: () => t("delete_error"),
    statusChanged: (subject: string, status: string) => t("status_changed", { subject, status }),
    statusError: () => t("status_error"),
    staffRegistered: (name: string, role: string) => t("staff_registered", { name, role }),
    loginSuccess: (name: string) => t("login_success", { name }),
    loginError: () => t("login_error"),
    logoutInfo: () => t("logout_info"),
    allNotificationsRead: () => t("all_notifications_read"),
    allNotificationsReadError: () => t("all_notifications_read_error"),
  };
}

function getToastTranslator() {
  const locale = getUserLocale();
  return createTranslator({
    locale,
    messages: DICTIONARY[locale] ?? DICTIONARY.zh,
    namespace: "toast",
  });
}

/**
 * Centralized toast message helpers for non-React contexts or direct calls.
 * Powered by next-intl createTranslator.
 */
export const toastMessages = {
  // Generic CRUD
  created: (name: string) => getToastTranslator()("created", { name }),
  updated: (name: string) => getToastTranslator()("updated", { name }),
  deleted: () => getToastTranslator()("deleted"),
  createError: () => getToastTranslator()("create_error"),
  updateError: () => getToastTranslator()("update_error"),
  deleteError: () => getToastTranslator()("delete_error"),

  // Status change (Order / User)
  statusChanged: (subject: string, status: string) =>
    getToastTranslator()("status_changed", { subject, status }),
  statusError: () => getToastTranslator()("status_error"),

  // Staff-specific (includes role parameter)
  staffRegistered: (name: string, role: string) =>
    getToastTranslator()("staff_registered", { name, role }),

  // Auth
  loginSuccess: (name: string) => getToastTranslator()("login_success", { name }),
  loginError: () => getToastTranslator()("login_error"),
  logoutInfo: () => getToastTranslator()("logout_info"),

  // Notifications
  allNotificationsRead: () => getToastTranslator()("all_notifications_read"),
  allNotificationsReadError: () => getToastTranslator()("all_notifications_read_error"),
};
