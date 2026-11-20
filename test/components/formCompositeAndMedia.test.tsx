import { createAdapter } from "@uploadcn/core";
import { act, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { AvatarUpload } from "@/components/form/media/file-upload/AvatarUpload";
import { KeyValueInput } from "@/components/form/composite/key-value/KeyValueInput";
import { Repeater } from "@/components/form/composite/repeater/Repeater";
import { ColorPickerContent } from "@/components/form/media/color-picker/ColorPickerContent";
import { ColorPickerInput } from "@/components/form/media/color-picker/ColorPickerInput";
import { FileUploadCore } from "@/components/form/media/file-upload/FileUploadCore";
import { PlateEditorCore } from "@/components/form/media/rich-editor/PlateEditorCore";
import { RichEditorInput } from "@/components/form/media/rich-editor/RichEditorInput";
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

describe("RichEditor (Plate) single wrapper & Markdown rendering", () => {
  it("renders single label and error message through RichEditorInput", () => {
    renderWithProviders(<RichEditorInput name="bio" label="Biography" error="Biography is required" />, {
      locale: "en",
    });

    expect(screen.getAllByText("Biography")).toHaveLength(1);
    expect(screen.getAllByText("Biography is required")).toHaveLength(1);
  });

  it("deserializes Markdown content, renders official FixedToolbar buttons, and syncs external value changes", async () => {
    const { container, rerender } = renderWithProviders(
      <PlateEditorCore
        id="bio-editor"
        value={"## Heading Two\n\nHello **Plate**\n\n| Col A | Col B |\n| --- | --- |\n| Cell 1 | $E=mc^2$ |"}
        onChange={vi.fn()}
      />,
      { locale: "en" },
    );

    expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
    expect(screen.getByText("Heading Two")).toBeInTheDocument();
    expect(screen.getByText("Plate")).toBeInTheDocument();
    expect(screen.getByText("Col A")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
    expect(container.querySelector(".katex")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Indent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inline Equation" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Italic" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Link" })).toBeInTheDocument();
    expect(container.querySelector(".lucide-table")).toBeInTheDocument();
    expect(container.querySelector(".lucide-plus")).toBeInTheDocument();

    rerender(<PlateEditorCore id="bio-editor" value="Updated Markdown Content" onChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText("Updated Markdown Content")).toBeInTheDocument());

    rerender(<PlateEditorCore id="bio-editor" value="Read only body" readOnly onChange={vi.fn()} />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
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

describe("UploadCN FileUploadCore & AvatarUpload behavior", () => {
  it("merges concurrent UploadCN completions safely, aborts cancelled upload, and outputs URL array", async () => {
    const resolvers = new Map<string, (url: string) => void>();
    const abortedNames: string[] = [];
    const onChange = vi.fn();

    const adapter = createAdapter(async ({ file, signal }) => {
      signal.addEventListener("abort", () => abortedNames.push(file.name));
      const url = await new Promise<string>((resolve) => {
        resolvers.set(file.name, resolve);
      });
      return { url };
    });

    const { container } = renderWithProviders(
      <FileUploadCore id="attachments" value={[]} onChange={onChange} multiple adapter={adapter} />,
      { locale: "en" },
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(["one"], "one.png", { type: "image/png" });
    const file2 = new File(["two"], "two.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file1, file2] } });

    await waitFor(() => expect(resolvers.size).toBe(2));
    expect(onChange).not.toHaveBeenCalled();

    // Finish second file first (out of order)
    resolvers.get("two.png")!("/cdn/two.png");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(["/cdn/two.png"]));

    // Cancel pending first file -> aborts adapter AbortSignal
    const cancelBtn = screen.getByRole("button", { name: "Cancel upload of one.png" });
    fireEvent.click(cancelBtn);
    await waitFor(() => expect(abortedNames).toContain("one.png"));
  });

  it("renders error fallback without broken img when avatar upload fails and supports retry", async () => {
    let shouldFailOnce = true;
    const onChange = vi.fn();

    const adapter = createAdapter(async () => {
      if (shouldFailOnce) {
        shouldFailOnce = false;
        throw new Error("Transient failure");
      }
      return { url: "/cdn/retried.png" };
    });

    const { container, user } = renderWithProviders(
      <FileUploadCore id="avatar" mode="avatar" crop={false} value="" onChange={onChange} adapter={adapter} />,
      { locale: "en" },
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const avatarFile = new File(["a"], "fail.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [avatarFile] } });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Transient failure");
    expect(container.querySelector("img")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/cdn/retried.png"));
  });

  it("uploads with default localAdapter and removes persisted URLs cleanly", async () => {
    const onChange = vi.fn();
    function DocsHarness() {
      const [val, setVal] = useState<string[]>(["https://example.com/existing.pdf"]);
      return (
        <FileUploadCore
          id="docs"
          value={val}
          onChange={(next) => {
            const arr = (Array.isArray(next) ? next : []) as string[];
            setVal(arr);
            onChange(arr);
          }}
          multiple
        />
      );
    }

    const { container, user } = renderWithProviders(<DocsHarness />, { locale: "en" });

    expect(screen.getByText("existing.pdf")).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [new File(["hello"], "notes.txt", { type: "text/plain" })] },
    });

    let latestBlobUrl = "";
    await waitFor(() => {
      const latest = onChange.mock.calls.at(-1)?.[0] as string[] | undefined;
      expect(latest?.[0]).toBe("https://example.com/existing.pdf");
      expect(latest?.[1]).toMatch(/^blob:/);
      latestBlobUrl = latest?.[1] ?? "";
    });

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("existing.pdf")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([latestBlobUrl]);

    await user.click(screen.getByRole("button", { name: "Remove notes.txt" }));
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith([]));
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

  it("blocks unsafe javascript: and HTML data: URLs in FileUploadCore and AvatarUpload", () => {
    const { container } = renderWithProviders(
      <>
        <FileUploadCore
          id="sec-grid"
          value={["javascript:alert(1)", "blob:https://example.com/123"]}
          onChange={vi.fn()}
          showDownload
          showRemove={false}
        />
        <AvatarUpload src="data:text/html,<script>alert(1)</script>" />
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
