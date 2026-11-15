"use client";

import dynamic from "next/dynamic";

export * from "./PasswordStrengthMeter";
export * from "./PasswordInput";
export type { OtpInputProps } from "./OtpInput";

export const OtpInput = dynamic(() => import("./OtpInput").then((mod) => mod.OtpInput), { ssr: false });
