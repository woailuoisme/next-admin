"use client";

import {
  CurrencyInput,
  FormGrid,
  FormSection,
  MaskedInput,
  OtpInput,
  PasswordInput,
  RatingInput,
  SegmentedControl,
} from "@/components/form";

export interface SecurityFinanceTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function SecurityFinanceTab({ form }: SecurityFinanceTabProps) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Enterprise Authentication & Security"
        description="Password inputs with entropy meter, policy requirements checklist, CapsLock detector, and multi-slot OTP/PIN verification."
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <PasswordInput
            form={form}
            name="password"
            label="Secure Password (PasswordInput)"
            required
            clearable
            showStrength
            placeholder="Enter high-entropy password"
            colSpan={1}
          />
          <OtpInput
            form={form}
            name="twoFactorCode"
            label="Two-Factor Verification Code (OtpInput)"
            required
            length={6}
            groupSize={3}
            colSpan={1}
          />
        </FormGrid>
      </FormSection>

      <FormSection
        title="Finance, Formats & Interactive Controls"
        description="Live thousand-separator CurrencyInput, fixed pattern MaskedInput, RatingInput, and SegmentedControl."
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <CurrencyInput
            form={form}
            name="annualSalary"
            label="Annual Compensation (CurrencyInput)"
            currency="USD"
            currencySymbol="$"
            currencies={["USD", "EUR", "GBP", "CNY"]}
            colSpan={1}
          />
          <MaskedInput
            form={form}
            name="contactPhone"
            label="Direct Phone (MaskedInput)"
            mask="(###) ###-####"
            unmask
            colSpan={1}
          />
          <RatingInput
            form={form}
            name="ratingScore"
            label="Product Quality Rating (RatingInput)"
            allowHalf
            allowClear
            showScore
            colSpan={1}
          />
          <SegmentedControl
            form={form}
            name="billingCycle"
            label="Billing Interval (SegmentedControl)"
            options={[
              { label: "Monthly", value: "monthly" },
              { label: "Quarterly", value: "quarterly" },
              { label: "Annual", value: "annual", badge: "Save 20%" },
            ]}
            colSpan={1}
          />
        </FormGrid>
      </FormSection>
    </div>
  );
}
