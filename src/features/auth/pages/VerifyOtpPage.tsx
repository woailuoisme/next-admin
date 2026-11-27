"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { VerifyOtpForm } from "../components/VerifyOtpForm";
import { clearResetFlow, peekResetFlow } from "../resetFlow";

export function VerifyOtpPage() {
	const router = useRouter();
	const isMounted = useIsHydrated();
	const { flow, expired } = isMounted ? peekResetFlow() : { flow: null, expired: false };

	useEffect(() => {
		if (!isMounted || flow) return;
		if (expired) clearResetFlow();
		router.replace(expired ? "/forgot-password?expired=1" : "/forgot-password");
	}, [isMounted, flow, expired, router]);

	if (!flow) return null;

	return <VerifyOtpForm flow={flow} />;
}
