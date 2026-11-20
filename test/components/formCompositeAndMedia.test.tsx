import { act, fireEvent, renderHook } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { NextIntlClientProvider } from "next-intl";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const tiptapSpy = vi.hoisted(() => ({
  useEditor: vi.fn(),
}));

vi.mock("@tiptap/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tiptap/react")>();
  tiptapSpy.useEditor.mockImplementation((options, deps) => actual.useEditor(options, deps));
  return {
    ...actual,
    useEditor: tiptapSpy.useEditor,
  };
});

import { KeyValueInput } from "@/components/form/composite/key-value/KeyValueInput";
import { Repeater } from "@/components/form/composite/repeater/Repeater";
import { ColorPickerContent } from "@/components/form/media/color-picker/ColorPickerContent";
import { ColorPickerInput } from "@/components/form/media/color-picker/ColorPickerInput";
import { AvatarUploader } from "@/components/form/media/file-upload/AvatarUploader";
import { FileItemCard } from "@/components/form/media/file-upload/FileItemCard";
import { useFileUpload } from "@/components/form/media/file-upload/useFileUpload";
import { RichEditorInput } from "@/components/form/media/rich-editor/RichEditorInput";
import { RichEditorLinkPopover } from "@/components/form/media/rich-editor/RichEditorLinkPopover";
import { RichEditorToolbar } from "@/components/form/media/rich-editor/RichEditorToolbar";
import { TipTapCore } from "@/components/form/media/rich-editor/TipTapCore";
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

  it("renders TipTapCore immediately on the client without Next.js immediatelyRender warnings", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      const { container } = renderWithProviders(
        <TipTapCore
          id="bio-editor"
          value="<p>Hello world</p>"
          onChange={vi.fn()}
          format="html"
          toolbarButtons={["bold", "link"]}
        />,
        { locale: "en" },
      );

      expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
      if (typeof process === "undefined" || !process.versions?.bun) {
        expect(tiptapSpy.useEditor).toHaveBeenCalledWith(expect.objectContaining({ immediatelyRender: true }));
      }
      expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining("immediatelyRender"));
    } finally {
      warnSpy.mockRestore();
    }
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

  it("revokes mock transport blob URLs and excludes error items from maxCount limit in useFileUpload", async () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:initial-preview");
    URL.revokeObjectURL = vi.fn();

    try {
      let attempt = 0;
      const transport = {
        upload: vi.fn(async () => {
          attempt += 1;
          if (attempt === 1) {
            throw new Error("Transient failure");
          }
          return { url: "blob:mock-upload-result" };
        }),
      };

      const wrapper = ({ children }: { children: ReactNode }) => (
        <NextIntlClientProvider locale="en" messages={DICTIONARY.en}>
          {children}
        </NextIntlClientProvider>
      );

      const { result, unmount } = renderHook(
        () => {
          const [val, setVal] = useState<string | undefined>(undefined);
          return useFileUpload({
            value: val,
            onChange: setVal,
            transport,
            valueCodec: "url",
            multiple: false,
            maxFiles: 1,
          });
        },
        { wrapper },
      );

      const file1 = new File(["a"], "fail.png", { type: "image/png" });
      await act(async () => {
        await result.current.triggerUploadFiles([file1]);
      });

      // Failed item should not block uploading a replacement when maxCount=1
      expect(result.current.items[0]?.status).toBe("error");
      expect(result.current.canUploadMore).toBe(true);

      const file2 = new File(["b"], "ok.png", { type: "image/png" });
      await act(async () => {
        await result.current.triggerUploadFiles([file2]);
      });

      expect(result.current.items.some((it) => it.url === "blob:mock-upload-result")).toBe(true);
      unmount();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-upload-result");
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  it("updates RichEditorToolbar active and undo/redo disabled states on TipTap transactions", () => {
    let boldActive = false;
    let canUndo = false;
    const listeners = new Map<string, Set<() => void>>();

    const mockEditor = {
      isActive: (name: string) => (name === "bold" ? boldActive : false),
      can: () => ({
        undo: () => canUndo,
        redo: () => false,
      }),
      chain: () => ({
        focus: () => ({
          toggleBold: () => ({ run: () => true }),
          undo: () => ({ run: () => true }),
        }),
      }),
      on: (event: string, fn: () => void) => {
        const set = listeners.get(event) ?? new Set();
        set.add(fn);
        listeners.set(event, set);
      },
      off: (event: string, fn: () => void) => {
        listeners.get(event)?.delete(fn);
      },
    } as unknown as Editor;

    renderWithProviders(<RichEditorToolbar editor={mockEditor} toolbarButtons={["bold", "undo"]} />, {
      locale: "en",
    });

    const boldBtn = screen.getByRole("button", { name: "Bold" });
    const undoBtn = screen.getByRole("button", { name: "Undo" });
    expect(boldBtn).toHaveAttribute("aria-pressed", "false");
    expect(undoBtn).toBeDisabled();

    act(() => {
      boldActive = true;
      canUndo = true;
      listeners.get("transaction")?.forEach((cb) => cb());
    });

    expect(boldBtn).toHaveAttribute("aria-pressed", "true");
    expect(undoBtn).toBeEnabled();
  });

  it("fires Repeater and KeyValueInput onBlur only when focus leaves the container", async () => {
    const onRepeaterBlur = vi.fn();
    const onKvBlur = vi.fn();

    renderWithProviders(
      <>
        <Repeater<{ name: string }>
          name="rep"
          value={[{ name: "a" }]}
          onChange={vi.fn()}
          onBlur={onRepeaterBlur}
          createItem={() => ({ name: "" })}
          renderItem={(item, idx, updateItem) => (
            <input
              aria-label={`rep-item-${idx}`}
              value={item.name}
              onChange={(e) => updateItem({ name: e.target.value })}
            />
          )}
        />
        <KeyValueInput
          name="kv"
          value={[{ key: "k", value: "v" }]}
          valueType="array"
          onChange={vi.fn()}
          onBlur={onKvBlur}
        />
        <button type="button">Outside Target</button>
      </>,
      { locale: "en" },
    );

    const repInput = await screen.findByLabelText("rep-item-0");
    const outsideBtn = screen.getByRole("button", { name: "Outside Target" });

    fireEvent.focus(repInput);
    fireEvent.blur(repInput, { relatedTarget: repInput });
    expect(onRepeaterBlur).not.toHaveBeenCalled();

    fireEvent.blur(repInput, { relatedTarget: outsideBtn });
    expect(onRepeaterBlur).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      const kvInputs = screen.getAllByRole("textbox");
      expect(kvInputs.some((el) => (el as HTMLInputElement).value === "k")).toBe(true);
    });
    const kvInputs = screen.getAllByRole("textbox");
    const kvKeyInput = kvInputs.find((el) => (el as HTMLInputElement).value === "k")!;
    const kvValInput = kvInputs.find((el) => (el as HTMLInputElement).value === "v")!;

    fireEvent.focus(kvKeyInput);
    fireEvent.blur(kvKeyInput, { relatedTarget: kvValInput });
    expect(onKvBlur).not.toHaveBeenCalled();

    fireEvent.blur(kvValInput, { relatedTarget: outsideBtn });
    expect(onKvBlur).toHaveBeenCalledTimes(1);
  });

  it("blocks unsafe javascript: and HTML data: URLs in FileItemCard and AvatarUploader", () => {
    const { container } = renderWithProviders(
      <>
        <FileItemCard
          file={{
            id: "bad-1",
            name: "evil.png",
            size: 120,
            type: "image/png",
            status: "done",
            url: "javascript:alert(1)",
          }}
          showDownload
          showRemove={false}
          onPreview={vi.fn()}
          onRemove={vi.fn()}
        />
        <AvatarUploader
          currentAvatar={{
            id: "bad-avatar",
            name: "avatar.png",
            size: 120,
            type: "image/png",
            status: "done",
            url: "data:text/html,<script>alert(1)</script>",
          }}
          isDragging={false}
          canUploadMore={false}
          onChooseFile={vi.fn()}
          onRemove={vi.fn()}
          onDragOver={vi.fn()}
          onDragLeave={vi.fn()}
          onDrop={vi.fn()}
        />
        <FileItemCard
          file={{
            id: "good-1",
            name: "safe.png",
            size: 120,
            type: "image/png",
            status: "done",
            url: "blob:https://example.com/123",
          }}
          showDownload
          showRemove={false}
          onPreview={vi.fn()}
          onRemove={vi.fn()}
        />
      </>,
      { locale: "en" },
    );

    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute("src", "blob:https://example.com/123");

    const anchors = Array.from(container.querySelectorAll("a"));
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toHaveAttribute("href", "blob:https://example.com/123");
  });
});
