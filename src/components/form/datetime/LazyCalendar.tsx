"use client";

import { enUS, zhCN } from "date-fns/locale";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

import { Skeleton } from "@/components/ui/skeleton";

const InnerLazyCalendar = dynamic(() => import("@/components/ui/calendar").then((mod) => mod.Calendar), {
	ssr: false,
	loading: () => <Skeleton className="size-64 rounded-lg" />,
});

type CalendarProps = ComponentProps<typeof InnerLazyCalendar>;

export function LocalizedLazyCalendar(props: CalendarProps) {
	const locale = useLocale();
	const calendarLocale = props.locale ?? (locale.startsWith("zh") ? zhCN : enUS);
	return <InnerLazyCalendar {...props} locale={calendarLocale} />;
}
