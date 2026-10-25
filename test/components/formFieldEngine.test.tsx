import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MaskedInput } from "@/components/form/basic/MaskedInput";
import { CheckboxGroup } from "@/components/form/choice/CheckboxGroup";
import { RadioGroupInput } from "@/components/form/choice/RadioGroupInput";
import { SegmentedControl } from "@/components/form/choice/SegmentedControl";
import { SwitchInput } from "@/components/form/choice/SwitchInput";
import { TagsInput } from "@/components/form/choice/TagsInput";
import { FormFieldEngine } from "@/components/form/core/FormFieldEngine";
import { OtpInput } from "@/components/form/security/OtpInput";
import { renderWithProviders, screen } from "test/test-utils";

describe("FormFieldEngine (Core Seam)", () => {
  it("renders label, required mark, tooltip, hint, and children", () => {
    renderWithProviders(
      <FormFieldEngine
        name="username"
        label="Username"
        required
        hint="Unique username"
        helperText="Enter 3-20 characters"
        tooltip="Your public account handle"
      >
        {({ id, value, onChange, hasError }) => (
          <input
            id={id}
            aria-invalid={hasError}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type username"
          />
        )}
      </FormFieldEngine>,
    );

    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("*")).toBeInTheDocument();
    expect(screen.getByText("Unique username")).toBeInTheDocument();
    expect(screen.getByText("Enter 3-20 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type username")).toBeInTheDocument();
  });

  it("handles controlled value updates and triggers onChange", () => {
    const handleChange = vi.fn();

    renderWithProviders(
      <FormFieldEngine name="email" value="user@example.com" onChange={handleChange}>
        {({ id, value, onChange }) => (
          <input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid="email-input" />
        )}
      </FormFieldEngine>,
    );

    const input = screen.getByTestId("email-input");
    expect(input).toHaveValue("user@example.com");

    fireEvent.change(input, { target: { value: "new@example.com" } });
    expect(handleChange).toHaveBeenCalledWith("new@example.com");
  });

  it("displays explicit error message and marks field as invalid", () => {
    renderWithProviders(
      <FormFieldEngine name="email" error="Invalid email address">
        {({ id, hasError }) => <input id={id} aria-invalid={hasError} data-testid="error-input" />}
      </FormFieldEngine>,
    );

    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(screen.getByTestId("error-input")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("FormFieldEngine Unified Inputs", () => {
  it("MaskedInput formats input and propagates changes without render-phase setState", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <MaskedInput name="phone" label="Phone Number" mask="###-####" value="1234567" onChange={handleChange} />,
    );

    const input = screen.getByRole("textbox", { name: "Phone Number" });
    expect(input).toHaveValue("123-4567");

    fireEvent.change(input, { target: { value: "9876543" } });
    expect(handleChange).toHaveBeenCalledWith("987-6543");
  });

  it("SegmentedControl renders options and switches selection via engine", () => {
    const handleChange = vi.fn();
    const options = [
      { label: "Day", value: "day" },
      { label: "Week", value: "week" },
    ];

    renderWithProviders(
      <SegmentedControl name="period" label="Period" value="day" options={options} onChange={handleChange} />,
    );

    expect(screen.getByText("Period")).toBeInTheDocument();
    const weekBtn = screen.getByRole("radio", { name: /week/i });
    fireEvent.click(weekBtn);
    expect(handleChange).toHaveBeenCalledWith("week");
  });

  it("RadioGroupInput renders options and calls onChange", () => {
    const handleChange = vi.fn();
    const options = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ];

    renderWithProviders(
      <RadioGroupInput name="choice" label="Your Choice" value="a" options={options} onChange={handleChange} />,
    );

    expect(screen.getByText("Your Choice")).toBeInTheDocument();
    const optionB = screen.getByLabelText("Option B");
    fireEvent.click(optionB);
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("CheckboxGroup toggles items cleanly", () => {
    const handleChange = vi.fn();
    const options = [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
    ];

    renderWithProviders(
      <CheckboxGroup name="fruits" label="Fruits" value={["apple"]} options={options} onChange={handleChange} />,
    );

    const banana = screen.getByLabelText("Banana");
    fireEvent.click(banana);
    expect(handleChange).toHaveBeenCalledWith(["apple", "banana"]);
  });

  it("SwitchInput toggles state in inline card layout", () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <SwitchInput name="notifications" label="Enable Notifications" value={false} onChange={handleChange} inline />,
    );

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(switchEl);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("TagsInput adds new tag on Enter key", () => {
    const handleChange = vi.fn();
    renderWithProviders(<TagsInput name="skills" label="Skills" value={["React"]} onChange={handleChange} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Next.js" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleChange).toHaveBeenCalledWith(["React", "Next.js"]);
  });

  it("OtpInput renders input slots and handles complete callback", () => {
    const handleComplete = vi.fn();
    renderWithProviders(
      <OtpInput name="code" label="Verification Code" length={6} value="12345" onComplete={handleComplete} />,
    );

    expect(screen.getByText("Verification Code")).toBeInTheDocument();
  });
});
