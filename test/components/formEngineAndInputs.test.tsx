import { useForm } from "@tanstack/react-form";
import { act, fireEvent } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { FormDialog } from "@/components/dialogs/FormDialog";
import { TextInput } from "@/components/form/basic/TextInput";
import { TextareaInput } from "@/components/form/basic/TextareaInput";
import { CascaderInput } from "@/components/form/choice/CascaderInput";
import { CheckboxGroup } from "@/components/form/choice/CheckboxGroup";
import { RadioGroupInput } from "@/components/form/choice/RadioGroupInput";
import { TreeSelectInput } from "@/components/form/choice/TreeSelectInput";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 chars"),
});

function ZodFormHarness({ onValidSubmit }: { onValidSubmit: (vals: { username: string }) => void }) {
  const form = useForm({
    defaultValues: { username: "" },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => onValidSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <TextInput form={form} name="username" label="Account Username" />
      <button type="submit">Submit Form</button>
    </form>
  );
}

describe("FormFieldEngine + TanStack Form + Zod & FormDialog", () => {
  it("extracts Standard Schema object errors on submit and clears when valid", async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ZodFormHarness onValidSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit Form" }));
    expect(await screen.findByText("Username must be at least 3 chars")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Account Username" })).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: "Account Username" }), "alice");
    await user.click(screen.getByRole("button", { name: "Submit Form" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ username: "alice" }));
  });

  it("re-syncs async defaultValues in FormDialog while form is clean and preserves edits when dirty", async () => {
    function AsyncDefaultsDialogHarness({ defaultTitle }: { defaultTitle: string }) {
      const form = useForm({
        defaultValues: { title: "" },
        onSubmit: () => {},
      });

      return (
        <FormDialog open onOpenChange={() => {}} form={form} entityName="Item" defaultValues={{ title: defaultTitle }}>
          <TextInput form={form} name="title" label="Item Title" />
        </FormDialog>
      );
    }

    const { rerender, user } = renderWithProviders(<AsyncDefaultsDialogHarness defaultTitle="Initial Title" />);
    const input = await screen.findByRole("textbox", { name: "Item Title" });
    expect(input).toHaveValue("Initial Title");

    rerender(<AsyncDefaultsDialogHarness defaultTitle="Loaded Async Title" />);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Item Title" })).toHaveValue("Loaded Async Title"));

    await user.clear(screen.getByRole("textbox", { name: "Item Title" }));
    await user.type(screen.getByRole("textbox", { name: "Item Title" }), "User Edited");

    rerender(<AsyncDefaultsDialogHarness defaultTitle="Late Overwrite Attempt" />);
    expect(screen.getByRole("textbox", { name: "Item Title" })).toHaveValue("User Edited");
  });

  it("skips redundant form resets when FormDialog receives deep-equal fresh inline defaultValues", async () => {
    const resetSpy = vi.fn();

    function DeepEqualDefaultsHarness({ tick }: { tick: number }) {
      const form = useForm({
        defaultValues: { title: "Same Title" },
        onSubmit: () => {},
      });

      useEffect(() => {
        const spy = vi.spyOn(form, "reset").mockImplementation((...args) => {
          resetSpy(...args);
        });
        return () => spy.mockRestore();
      }, [form]);

      return (
        <FormDialog
          open
          onOpenChange={() => {}}
          form={form}
          entityName={`Item-${tick}`}
          defaultValues={{ title: "Same Title" }}
        >
          <TextInput form={form} name="title" label="Item Title" />
        </FormDialog>
      );
    }

    const { rerender } = renderWithProviders(<DeepEqualDefaultsHarness tick={1} />);
    await screen.findByRole("textbox", { name: "Item Title" });
    expect(resetSpy).not.toHaveBeenCalled();

    rerender(<DeepEqualDefaultsHarness tick={2} />);
    expect(resetSpy).not.toHaveBeenCalled();
  });
});

describe("Debounced & ReadOnly Inputs and Card Choice Groups", () => {
  it("debounces TextInput & TextareaInput and flushes pending draft on blur", () => {
    vi.useFakeTimers();
    const onTextChange = vi.fn();
    const onAreaChange = vi.fn();

    renderWithProviders(
      <>
        <TextInput name="query" label="Search Query" value="" debounceMs={150} onChange={onTextChange} />
        <TextareaInput name="bio" label="Bio" value="" debounceMs={150} onChange={onAreaChange} />
      </>,
    );

    const textEl = screen.getByRole("textbox", { name: "Search Query" });
    fireEvent.change(textEl, { target: { value: "hello" } });
    expect(textEl).toHaveValue("hello");
    expect(onTextChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onTextChange).toHaveBeenCalledWith("hello");

    const areaEl = screen.getByRole("textbox", { name: "Bio" });
    fireEvent.change(areaEl, { target: { value: "flushed draft" } });
    fireEvent.blur(areaEl);
    expect(onAreaChange).toHaveBeenCalledWith("flushed draft");

    vi.useRealTimers();
  });

  it("blocks edits when readOnly and triggers card groups once per click", async () => {
    const onReadOnlyChange = vi.fn();
    const onCheckChange = vi.fn();
    const onRadioChange = vi.fn();

    const { user } = renderWithProviders(
      <>
        <TextInput name="locked" label="Locked Field" value="fixed" readOnly onChange={onReadOnlyChange} />
        <CheckboxGroup
          name="roles"
          label="Roles"
          card
          value={[]}
          options={[{ label: "Admin", value: "admin", description: "Full access" }]}
          onChange={onCheckChange}
        />
        <RadioGroupInput
          name="tier"
          label="Tier"
          card
          value="free"
          options={[
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
          ]}
          onChange={onRadioChange}
        />
      </>,
    );

    const lockedInput = screen.getByRole("textbox", { name: "Locked Field" });
    expect(lockedInput).toHaveAttribute("readonly");
    await user.type(lockedInput, "extra");
    expect(onReadOnlyChange).not.toHaveBeenCalled();

    await user.click(screen.getByText("Full access"));
    expect(onCheckChange).toHaveBeenCalledTimes(1);
    expect(onCheckChange).toHaveBeenCalledWith(["admin"]);

    await user.click(screen.getByText("Pro"));
    expect(onRadioChange).toHaveBeenCalledTimes(1);
    expect(onRadioChange).toHaveBeenCalledWith("pro");
  });
});

describe("TreeSelect & Cascader A11y & Keyboard Clear", () => {
  it("renders sibling clear buttons outside combobox triggers and clears via click and Backspace", async () => {
    function ControlledTreeAndCascader() {
      const [treeVal, setTreeVal] = useState<string | number | undefined>("fe");
      const [cascaderVal, setCascaderVal] = useState<(string | number)[]>(["cn", "bj"]);

      return (
        <>
          <TreeSelectInput
            name="dept"
            label="Department"
            value={treeVal}
            onChange={(val) => setTreeVal(val as string | undefined)}
            treeData={[
              {
                value: "eng",
                label: "Engineering",
                children: [{ value: "fe", label: "Frontend" }],
              },
            ]}
          />
          <CascaderInput
            name="region"
            label="Region"
            value={cascaderVal}
            onChange={(vals) => setCascaderVal(vals)}
            showSearch
            options={[
              {
                value: "cn",
                label: "China",
                children: [{ value: "bj", label: "Beijing" }],
              },
            ]}
          />
        </>
      );
    }

    const { user } = renderWithProviders(<ControlledTreeAndCascader />, { locale: "en" });

    const triggers = screen.getAllByRole("combobox");
    const treeTrigger = triggers[0]!;
    const cascaderTrigger = triggers[1]!;

    const clearTreeBtn = screen.getAllByRole("button", { name: "Clear selection" })[0]!;
    const clearCascaderBtn = screen.getAllByRole("button", { name: "Clear selection" })[1]!;

    // Ensure no nested interactive elements inside trigger buttons
    expect(treeTrigger.contains(clearTreeBtn)).toBe(false);
    expect(cascaderTrigger.contains(clearCascaderBtn)).toBe(false);

    // Click sibling clear on TreeSelect
    await user.click(clearTreeBtn);
    expect(screen.getByText("Select item...")).toBeInTheDocument();

    // Keyboard Backspace clear on Cascader
    cascaderTrigger.focus();
    await user.keyboard("{Backspace}");
    expect(screen.getByText("Please select...")).toBeInTheDocument();
  });

  it("renders multi-select TreeSelect tag removal buttons outside the combobox trigger", async () => {
    const onMultiChange = vi.fn();
    const { user } = renderWithProviders(
      <TreeSelectInput
        name="depts"
        label="Departments"
        multiple
        value={["fe", "be"]}
        onChange={(vals) => onMultiChange(vals)}
        treeData={[
          {
            value: "eng",
            label: "Engineering",
            children: [
              { value: "fe", label: "Frontend" },
              { value: "be", label: "Backend" },
            ],
          },
        ]}
      />,
      { locale: "en" },
    );

    const combobox = screen.getByRole("combobox");
    const removeFrontendBtn = screen.getByRole("button", { name: /Remove Frontend/i });
    expect(combobox.contains(removeFrontendBtn)).toBe(false);

    await user.click(removeFrontendBtn);
    expect(onMultiChange).toHaveBeenCalledWith(["be"]);
  });
});
