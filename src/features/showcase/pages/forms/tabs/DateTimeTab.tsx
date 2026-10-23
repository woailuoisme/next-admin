"use client";

import { DatePickerInput, DateRangePickerInput, FormGrid, FormSection, TimePickerInput } from "@/components/form";

export interface DateTimeTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function DateTimeTab({ form }: DateTimeTabProps) {
  return (
    <FormSection
      title="Calendar & Time Pickers"
      description="Single date, date range popovers, and 24-hour time pickers."
    >
      <FormGrid columns={{ sm: 1, md: 3 }}>
        <DatePickerInput form={form} name="joinDate" label="Onboarding Date" dateFormat="yyyy-MM-dd" colSpan={1} />
        <DateRangePickerInput form={form} name="vacationRange" label="Leave Range (DateRangePicker)" colSpan={1} />
        <TimePickerInput form={form} name="dailyCheckinTime" label="Daily Standup Time" colSpan={1} />
      </FormGrid>
    </FormSection>
  );
}
