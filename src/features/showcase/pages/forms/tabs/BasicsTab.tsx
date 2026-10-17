"use client";

import { Mail } from "lucide-react";

import { FormGrid, FormSection, NumberInput, SliderInput, TextareaInput, TextInput } from "@/components/form";

import { formatRating } from "../constants";

export interface BasicsTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function BasicsTab({ form }: BasicsTabProps) {
  return (
    <div className="space-y-6">
      <FormSection
        title="User Identity & Biography"
        description="Standard inputs, textareas, numeric steppers, and range sliders."
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <TextInput
            form={form}
            name="name"
            label="Full Name"
            required
            prefix={<Mail className="size-3.5" />}
            placeholder="John Doe"
            colSpan={1}
          />
          <TextInput
            form={form}
            name="email"
            type="email"
            label="Work Email"
            required
            placeholder="name@company.com"
            colSpan={1}
          />
          <NumberInput
            form={form}
            name="age"
            label="User Age (NumberInput with Steppers)"
            min={18}
            max={120}
            step={1}
            suffix="years old"
            colSpan={1}
          />
          <SliderInput
            form={form}
            name="rating"
            label="Performance Score (SliderInput)"
            min={0}
            max={100}
            step={5}
            formatValue={formatRating}
            colSpan={1}
          />
          <TextareaInput
            form={form}
            name="bio"
            label="Professional Biography"
            rows={3}
            showCount
            maxLength={300}
            colSpan="full"
          />
        </FormGrid>
      </FormSection>
    </div>
  );
}
