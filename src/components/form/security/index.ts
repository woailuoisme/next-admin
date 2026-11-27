"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export { PasswordInput, type PasswordInputProps } from "./PasswordInput";
export {
  calculatePasswordStrength,
  DEFAULT_PASSWORD_REQUIREMENTS,
  PasswordStrengthMeter,
  type PasswordStrengthMeterProps,
} from "./PasswordStrengthMeter";
export type { OtpExtraProps, OtpInputProps } from "./OtpInput";

export const OtpInput = dynamic(() => import("./OtpInput").then((mod) => mod.OtpInput), {
  ssr: false,
  loading: () => createElement(Skeleton, { className: "h-9 w-56 rounded-lg" }),
});
