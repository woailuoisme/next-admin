"use client";

import { DatePickerInput, DateRangePickerInput, TimePickerInput } from "@/components/form/datetime";
import { Grid, Section } from "@/components/shared/layout";

export interface DateTimeTabProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
	form: any;
}

export function DateTimeTab({ form }: DateTimeTabProps) {
	return (
		<Section title="Calendar & Time Pickers" description="Single date, date range popovers, and 24-hour time pickers.">
			<Grid columns={{ sm: 1, md: 3 }}>
				<DatePickerInput form={form} name="joinDate" label="Onboarding Date" dateFormat="yyyy-MM-dd" colSpan={1} />
				<DateRangePickerInput form={form} name="vacationRange" label="Leave Range (DateRangePicker)" colSpan={1} />
				<TimePickerInput form={form} name="dailyCheckinTime" label="Daily Standup Time" colSpan={1} />
			</Grid>
		</Section>
	);
}
