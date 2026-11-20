import { z } from "zod";

import { sanitizeUrl } from "@/components/shared/url";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

/** 重置密码的跨字段校验文案（由调用方注入，避免把界面文案写死在 schema 里） */
export interface ResetPasswordMessages {
  tooShort: string;
  tooWeak: string;
  sameAsEmail: string;
  mismatch: string;
}

const MIN_PASSWORD_LENGTH = 8;
const CHARACTER_CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];

/** 至少 8 位且命中两类字符 */
export function isStrongEnough(password: string): boolean {
  if (password.length < MIN_PASSWORD_LENGTH) return false;
  return CHARACTER_CLASSES.filter((pattern) => pattern.test(password)).length >= 2;
}

export function buildResetPasswordSchema(messages: ResetPasswordMessages) {
  return z
    .object({
      email: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine(({ email, password, confirmPassword }, ctx) => {
      if (password.length < MIN_PASSWORD_LENGTH) {
        ctx.addIssue({ code: "custom", path: ["password"], message: messages.tooShort });
        return;
      }
      if (!isStrongEnough(password)) {
        ctx.addIssue({ code: "custom", path: ["password"], message: messages.tooWeak });
        return;
      }
      if (email && password.toLowerCase() === email.toLowerCase()) {
        ctx.addIssue({ code: "custom", path: ["password"], message: messages.sameAsEmail });
        return;
      }
      if (password !== confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: messages.mismatch });
      }
    });
}

/** 默认（英文）实例：供测试与非 React 场景使用 */
export const resetPasswordSchema = buildResetPasswordSchema({
  tooShort: "Password must be at least 8 characters",
  tooWeak: "Password must contain at least two character types",
  sameAsEmail: "Password must differ from the email address",
  mismatch: "Passwords do not match",
});

export const PASSWORD_REQUIREMENT_LABEL_KEYS = [
  "password_req_length",
  "password_req_case",
  "password_req_number",
  "password_req_symbol",
] as const;

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function buildProfileSchema(messages: { nameRequired: string; avatarInvalid: string }) {
  return z.object({
    name: z.string().trim().min(2, messages.nameRequired),
    avatarUrl: z
      .string()
      .trim()
      .refine(
        (val) => !val || sanitizeUrl(val, { allowRelative: true, allowBareDomain: false }) !== null,
        messages.avatarInvalid,
      ),
  });
}

export function buildChangePasswordSchema(
  messages: ResetPasswordMessages & { currentRequired: string },
  currentEmail?: string,
) {
  return z
    .object({
      currentPassword: z.string().min(1, messages.currentRequired),
      newPassword: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine(({ newPassword, confirmPassword }, ctx) => {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        ctx.addIssue({ code: "custom", path: ["newPassword"], message: messages.tooShort });
        return;
      }
      if (!isStrongEnough(newPassword)) {
        ctx.addIssue({ code: "custom", path: ["newPassword"], message: messages.tooWeak });
        return;
      }
      if (currentEmail && newPassword.toLowerCase() === currentEmail.toLowerCase()) {
        ctx.addIssue({ code: "custom", path: ["newPassword"], message: messages.sameAsEmail });
        return;
      }
      if (newPassword !== confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: messages.mismatch });
      }
    });
}
