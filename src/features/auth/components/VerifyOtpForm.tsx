"use client";

import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpInput } from "@/components/form/security/OtpInput";
import type { MessageKeyOf } from "@/types/i18n";

import { resolveResetErrorKey, useForgotPasswordMutation, useVerifyOtpMutation } from "../hooks";
import type { ResetFlowState } from "../resetFlow";

import { AuthCard, AuthFormError, AuthSubmitButton } from "./AuthShell";

const RESEND_COOLDOWN_SECONDS = 60;

export interface VerifyOtpFormProps {
	flow: ResetFlowState;
}

export function VerifyOtpForm({ flow }: VerifyOtpFormProps) {
	const t = useTranslations("auth");
	const verifyMutation = useVerifyOtpMutation();
	const resendMutation = useForgotPasswordMutation();

	const [activeTicket, setActiveTicket] = useState(flow.ticket);
	const [prevPropTicket, setPrevPropTicket] = useState(flow.ticket);
	if (flow.ticket !== prevPropTicket) {
		setPrevPropTicket(flow.ticket);
		setActiveTicket(flow.ticket);
	}

	const [code, setCode] = useState("");
	const [errorKey, setErrorKey] = useState<MessageKeyOf<"auth"> | null>(null);
	const [isLocked, setIsLocked] = useState(false);
	const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
	const cooldownTargetRef = useRef<number | null>(null);
	const isCoolingDown = cooldown > 0;

	useEffect(() => {
		if (!isCoolingDown) {
			cooldownTargetRef.current = null;
			return;
		}
		if (cooldownTargetRef.current === null) {
			cooldownTargetRef.current = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
		}
		const timer = setInterval(() => {
			const target = cooldownTargetRef.current ?? Date.now();
			const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
			setCooldown(remaining);
			if (remaining === 0) {
				cooldownTargetRef.current = null;
			}
		}, 1000);
		return () => clearInterval(timer);
	}, [isCoolingDown]);

	const submitCode = async (value: string) => {
		if (isLocked || value.length !== 6) return;
		setErrorKey(null);
		try {
			await verifyMutation.mutateAsync({ ticket: activeTicket, code: value });
		} catch (error) {
			const key = await resolveResetErrorKey(error);
			setErrorKey(key ?? "error_request_failed");
			if (key === "error_too_many_attempts" || key === "error_ticket_expired") {
				setIsLocked(true);
			}
			setCode("");
		}
	};

	const handleResend = async () => {
		if (cooldown > 0 || resendMutation.isPending) return;
		setErrorKey(null);
		setIsLocked(false);
		try {
			const response = await resendMutation.mutateAsync({ email: flow.email });
			setActiveTicket(response.ticket);
			setCode("");
			cooldownTargetRef.current = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
			setCooldown(RESEND_COOLDOWN_SECONDS);
		} catch (error) {
			setErrorKey((await resolveResetErrorKey(error)) ?? "error_request_failed");
		}
	};

	const isSubmitting = verifyMutation.isPending;

	return (
		<AuthCard>
			<CardHeader className="flex flex-col gap-1 text-center">
				<CardTitle className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight">
					<ShieldCheck className="text-primary size-5" aria-hidden="true" />
					{t("verify_card_title")}
				</CardTitle>
				<CardDescription className="text-xs">{t("verify_card_hint", { email: flow.email })}</CardDescription>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<OtpInput
					label={t("otp_label")}
					value={code}
					onChange={setCode}
					onComplete={(value) => void submitCode(value)}
					length={6}
					separator={false}
					align="center"
					disabled={isSubmitting || isLocked}
					autoFocus
				/>

				<p className="text-muted-foreground text-center text-[11px]">{t("code_sent_hint")}</p>

				{errorKey ? <AuthFormError message={t(errorKey)} className="justify-center" /> : null}

				<AuthSubmitButton
					type="button"
					isPending={isSubmitting}
					pendingLabel={t("verifying")}
					label={t("verify_action")}
					disabled={code.length !== 6 || isLocked}
					onClick={() => void submitCode(code)}
				/>

				<div className="flex flex-col items-center gap-2">
					{isLocked ? (
						<Button asChild variant="outline" size="sm" className="text-xs">
							<Link href="/forgot-password">
								<RefreshCw data-icon="inline-start" aria-hidden="true" />
								{t("restart_flow")}
							</Link>
						</Button>
					) : (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-xs"
							disabled={cooldown > 0 || resendMutation.isPending}
							onClick={() => void handleResend()}
						>
							<RefreshCw
								data-icon="inline-start"
								className={resendMutation.isPending ? "animate-spin motion-reduce:animate-none" : undefined}
								aria-hidden="true"
							/>
							{cooldown > 0 ? t("resend_in", { seconds: cooldown }) : t("resend")}
						</Button>
					)}

					<Link
						href="/login"
						className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
					>
						<ArrowLeft className="size-3.5" aria-hidden="true" />
						{t("back_to_login")}
					</Link>
				</div>
			</CardContent>
		</AuthCard>
	);
}
