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
