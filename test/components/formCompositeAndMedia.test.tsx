import { act, fireEvent, renderHook } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { NextIntlClientProvider } from "next-intl";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { KeyValueInput } from "@/components/form/composite/key-value/KeyValueInput";
import { Repeater } from "@/components/form/composite/repeater/Repeater";
import { ColorPickerContent } from "@/components/form/media/color-picker/ColorPickerContent";
import { ColorPickerInput } from "@/components/form/media/color-picker/ColorPickerInput";
import { AvatarUploader } from "@/components/form/media/file-upload/AvatarUploader";
import { useFileUpload } from "@/components/form/media/file-upload/useFileUpload";
import { RichEditorInput } from "@/components/form/media/rich-editor/RichEditorInput";
import { RichEditorLinkPopover } from "@/components/form/media/rich-editor/RichEditorLinkPopover";
import { DICTIONARY } from "@/i18n";
import { renderWithProviders, screen, waitFor } from "test/test-utils";

describe("Repeater WeakMap identity & focus preservation", () => {
  it("keeps DOM input focus even when items share a literal `.key` property", async () => {
    interface Row {
      key: string;
      label: string;
    }

    function RepeaterHarness() {
      const [items, setItems] = useState<Row[]>([
        { key: "shared", label: "First" },
        { key: "shared", label: "Second" },
      ]);

      return (
        <Repeater<Row>
          name="items"
          value={items}
          onChange={setItems}
          reorderable={false}
          createItem={() => ({ key: "shared", label: "" })}
          renderItem={(item, index, updateItem) => (
            <input
              aria-label={`row-input-${index}`}
              value={item.label}
              onChange={(e) => updateItem({ ...item, label: e.target.value })}
            />
          )}
        />
      );
    }

    renderWithProviders(<RepeaterHarness />, { locale: "en" });

    const firstInput = screen.getByRole("textbox", { name: "row-input-0" });
    firstInput.focus();
    expect(document.activeElement).toBe(firstInput);

    fireEvent.change(firstInput, { target: { value: "First Updated" } });

    const afterInput = screen.getByRole("textbox", { name: "row-input-0" });
    expect(afterInput).toBe(firstInput);
    expect(afterInput).toHaveValue("First Updated");
    expect(document.activeElement).toBe(afterInput);
  });
});

describe("KeyValueInput reconciliation & Raw mode", () => {
  it("shows duplicate badge, adds rows, and switches to JSON Raw mode", async () => {
    function KvHarness() {
      const [pairs, setPairs] = useState([
        { key: "NODE_ENV", value: "production" },
        { key: "NODE_ENV", value: "staging" },
      ]);

      return (
        <KeyValueInput
          name="env"
          label="Environment"
          value={pairs}
          valueType="array"
          allowDuplicateKeys={false}
          enableRawMode
          reorderable={false}
          onChange={(next) => setPairs(next as { key: string; value: string }[])}
        />
      );
    }

    const { user } = renderWithProviders(<KvHarness />, { locale: "en" });

    expect(screen.getByText("1 duplicate keys")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Raw/i }));
    const rawArea = await screen.findByRole("textbox");
    expect(rawArea).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Apply & Back" }));
    expect(screen.getByRole("button", { name: "Add Property" })).toBeInTheDocument();
  });
});

describe("RichEditor single wrapper & safe link filtering", () => {
  it("renders single label and error message through RichEditorInput", () => {
    renderWithProviders(<RichEditorInput name="bio" label="Biography" error="Biography is required" />, {
      locale: "en",
    });

    expect(screen.getAllByText("Biography")).toHaveLength(1);
    expect(screen.getAllByText("Biography is required")).toHaveLength(1);
  });

  it("rejects javascript: links with inline validation alert in RichEditorLinkPopover", async () => {
    const setLink = vi.fn(() => ({ run: vi.fn() }));
    const unsetLink = vi.fn(() => ({ run: vi.fn() }));
    const chainObj = {
      focus: () => chainObj,
      extendMarkRange: () => chainObj,
      setLink,
      unsetLink,
    };
    const mockEditor = {
      isActive: () => false,
      getAttributes: () => ({}),
      chain: () => chainObj,
    } as unknown as Editor;

    const { user } = renderWithProviders(<RichEditorLinkPopover editor={mockEditor} />, { locale: "en" });

    await user.click(screen.getByRole("button", { name: "Link" }));
    const urlInput = await screen.findByPlaceholderText("Enter link URL...");
    await user.type(urlInput, "javascript:alert(1)");
    await user.click(screen.getByRole("button", { name: "Apply Link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid or unsupported link URL protocol");
    expect(setLink).not.toHaveBeenCalled();
  });
});

describe("ColorPicker keyboard nav & HEX validation", () => {
  it("navigates palette swatches with arrow keys and shows invalid HEX feedback", () => {
    const handleChange = vi.fn();

    renderWithProviders(
      <>
        <ColorPickerInput name="brandColor" label="Brand Color" value="#3b82f6" onChange={handleChange} />
        <ColorPickerContent
          value="#3b82f6"
          onChange={handleChange}
          presets={["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1"]}
        />
      </>,
      { locale: "en" },
    );

    const hexInput = screen.getByRole("textbox", { name: "HEX color value" });
    fireEvent.change(hexInput, { target: { value: "zzzzzz" } });
    fireEvent.blur(hexInput);

    expect(hexInput).toHaveValue("#zzzzzz");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid HEX color");
    expect(handleChange).not.toHaveBeenCalled();

    const firstSwatch = screen.getByRole("option", { name: "Select color #ef4444" });
    act(() => {
      firstSwatch.focus();
    });
    fireEvent.keyDown(firstSwatch, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Select color #f97316" }));

    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(firstSwatch);

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("option", { name: "Select color #6366f1" }));
  });
});

describe("useFileUpload concurrent uploads & cleanup", () => {
  it("merges concurrent completions safely and revokes preview blob URLs on remove", async () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    let blobSeq = 0;
    URL.createObjectURL = vi.fn(() => `blob:preview-${++blobSeq}`);
    URL.revokeObjectURL = vi.fn();

    try {
      const resolvers: Array<(url: string) => void> = [];
      const transport = {
        upload: vi.fn(
          () =>
            new Promise<string>((resolve) => {
              resolvers.push(resolve);
            }),
        ),
      };

      const onChange = vi.fn();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <NextIntlClientProvider locale="en" messages={DICTIONARY.en}>
          {children}
        </NextIntlClientProvider>
      );

      const { result, unmount } = renderHook(
        () =>
          useFileUpload({
            value: [],
            onChange,
            transport,
            valueCodec: "url",
            multiple: true,
          }),
        { wrapper },
      );

      const file1 = new File(["one"], "one.png", { type: "image/png" });
      const file2 = new File(["two"], "two.png", { type: "image/png" });

      act(() => {
        result.current.triggerUploadFiles([file1, file2]);
      });

      expect(result.current.items).toHaveLength(2);
      // In-flight files are not emitted as URLs yet
      expect(onChange).not.toHaveBeenCalled();

      // Finish second file first (out of order)
      await act(async () => {
        resolvers[1]!("/cdn/two.png");
      });

      await waitFor(() => expect(onChange).toHaveBeenCalledWith(["/cdn/two.png"]));
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-2");

      // Remove first file before upload completes -> aborts & revokes blob:preview-1
      const firstId = result.current.items[0]!.id;
      act(() => {
        result.current.handleRemove(firstId);
      });
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview-1");

      unmount();
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("allows clicking existing avatar in AvatarUploader to replace even when canUploadMore is false", async () => {
    const onChooseFile = vi.fn();
    const onRemove = vi.fn();
    const { user } = renderWithProviders(
      <AvatarUploader
        currentAvatar={{ id: "av1", name: "avatar.png", url: "https://cdn.example.com/a.png", status: "done" }}
        isDragging={false}
        canUploadMore={false}
        onChooseFile={onChooseFile}
        onRemove={onRemove}
        onDragOver={() => {}}
        onDragLeave={() => {}}
        onDrop={() => {}}
      />,
      { locale: "en" },
    );

    const avatarTrigger = screen.getAllByRole("button", { name: "Change Avatar" })[0]!;
    await user.click(avatarTrigger);
    expect(onChooseFile).toHaveBeenCalledTimes(1);
  });

  it("renders error fallback instead of broken empty-src img when avatar upload fails", () => {
    renderWithProviders(
      <AvatarUploader
        currentAvatar={{ id: "av-err", name: "broken.png", url: "", status: "error", error: "Upload failed" }}
        isDragging={false}
        canUploadMore={false}
        onChooseFile={() => {}}
        onRemove={() => {}}
        onDragOver={() => {}}
        onDragLeave={() => {}}
        onDrop={() => {}}
      />,
      { locale: "en" },
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });
});
