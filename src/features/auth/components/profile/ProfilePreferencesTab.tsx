"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { setUserLocale, type SupportedLocale } from "@/i18n/config";
import { setupZodLocale } from "@/lib/zod";
import {
	RADIUS_OPTIONS,
	THEME_CONFIGS,
	type ThemeColor,
	type ThemeMode,
	usePreferencesStore,
} from "@/stores/preferences";

export function ProfilePreferencesTab() {
	const t = useTranslations("profile");
	const locale = useLocale() as SupportedLocale;
	const router = useRouter();

	const theme = usePreferencesStore((s) => s.theme);
	const mode = usePreferencesStore((s) => s.mode);
	const radius = usePreferencesStore((s) => s.radius);
	const setTheme = usePreferencesStore((s) => s.setTheme);
	const setMode = usePreferencesStore((s) => s.setMode);
	const setRadius = usePreferencesStore((s) => s.setRadius);

	const handleLanguageChange = (nextLocale: SupportedLocale) => {
		if (nextLocale === locale) return;
		setUserLocale(nextLocale);
		setupZodLocale(nextLocale);
		router.refresh();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">{t("preferences_title")}</CardTitle>
				<CardDescription>{t("preferences_desc")}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<Label>{t("pref_theme_mode")}</Label>
					<div className="grid grid-cols-3 gap-2">
						{(
							[
								{ value: "light", label: t("pref_mode_light") },
								{ value: "dark", label: t("pref_mode_dark") },
								{ value: "auto", label: t("pref_mode_auto") },
							] satisfies { value: ThemeMode; label: string }[]
						).map((opt) => (
							<Button
								key={opt.value}
								type="button"
								variant={mode === opt.value ? "default" : "outline"}
								size="sm"
								aria-pressed={mode === opt.value}
								onClick={() => setMode(opt.value)}
								className="cursor-pointer"
							>
								{opt.label}
							</Button>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label>{t("pref_theme_color")}</Label>
					<div className="flex flex-wrap gap-2">
						{THEME_CONFIGS.map((cfg) => (
							<Button
								key={cfg.id}
								type="button"
								variant={theme === cfg.id ? "default" : "outline"}
								size="sm"
								aria-pressed={theme === cfg.id}
								onClick={() => setTheme(cfg.id as ThemeColor)}
								className="cursor-pointer gap-2"
							>
								<span
									className="size-3 rounded-full border border-current/20"
									style={{ backgroundColor: cfg.primaryColor }}
									aria-hidden="true"
								/>
								<span>{locale === "zh" ? cfg.name : cfg.nameEn}</span>
							</Button>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label>{t("pref_radius")}</Label>
					<div className="flex flex-wrap gap-2">
						{RADIUS_OPTIONS.map((opt) => (
							<Button
								key={opt.value}
								type="button"
								variant={radius === opt.value ? "default" : "outline"}
								size="sm"
								aria-pressed={radius === opt.value}
								onClick={() => setRadius(opt.value)}
								className="cursor-pointer"
							>
								{opt.label}
							</Button>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<Label>{t("pref_language")}</Label>
					<div className="flex gap-2">
						<Button
							type="button"
							variant={locale === "zh" ? "default" : "outline"}
							size="sm"
							aria-pressed={locale === "zh"}
							onClick={() => handleLanguageChange("zh")}
							className="cursor-pointer"
						>
							简体中文
						</Button>
						<Button
							type="button"
							variant={locale === "en" ? "default" : "outline"}
							size="sm"
							aria-pressed={locale === "en"}
							onClick={() => handleLanguageChange("en")}
							className="cursor-pointer"
						>
							English (US)
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
