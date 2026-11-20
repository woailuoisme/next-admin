import { describe, expect, it } from "vitest";

import {
  applyCascadingCheckChange,
  buildTreeIndex,
  collectCascaderSearchPaths,
  defaultFieldNames,
  filterCheckedKeysByStrategy,
  resolveCascadingCheckedState,
  splitHighlightSegments,
  type TreeSelectNode,
} from "@/components/form/choice/treeEngine";
import {
  convertRawFormat,
  formatJsonText,
  rawToRows,
  reconcileKvRows,
  rowsToRaw,
} from "@/components/form/composite/key-value/parsers";
import {
  getNextPaletteIndex,
  isValidHexColor,
  normalizeHexInput,
  toSixDigitHex,
} from "@/components/form/media/color-picker/colorUtils";
import { formatBytes, normalizeUrls, parseAllowedFileTypes } from "@/components/form/media/file-upload/utils";
import { sanitizeRichEditorUrl } from "@/components/shared/url";

describe("file-upload/utils", () => {
  it("normalizes single/array URL form values and parses accept rules for Uppy", () => {
    expect(normalizeUrls("/cdn/avatar.png")).toEqual(["/cdn/avatar.png"]);
    expect(normalizeUrls(["/a.png", "", "/b.pdf"])).toEqual(["/a.png", "/b.pdf"]);
    expect(normalizeUrls(null)).toEqual([]);
    expect(parseAllowedFileTypes("image/*, .pdf, */*")).toEqual(["image/*", ".pdf"]);
    expect(parseAllowedFileTypes("*/*")).toBeNull();
    expect(parseAllowedFileTypes("   ")).toBeNull();
  });
});

describe("key-value/parsers", () => {
  it("reconciles existing rows without losing stable _id identity", () => {
    const initial = [
      { _id: "id-1", key: "HOST", value: "localhost" },
      { _id: "id-2", key: "PORT", value: "3000" },
    ];

    const updatedObj = reconcileKvRows(initial, { HOST: "example.com", PORT: "3000", SSL: "true" });
    expect(updatedObj.map((r) => r._id).slice(0, 2)).toEqual(["id-1", "id-2"]);
    expect(updatedObj[0]?.value).toBe("example.com");
    expect(updatedObj[2]?.key).toBe("SSL");

    const dupArr = reconcileKvRows(initial, [
      { key: "HOST", value: "a" },
      { key: "HOST", value: "b" },
    ]);
    expect(dupArr.map((r) => r._id)).toEqual(["id-1", "id-2"]);
    expect(dupArr.every((r) => r.isDuplicate)).toBe(true);
  });

  it("parses and converts between .env and json raw formats", () => {
    const envText = '# comment\nAPI_KEY="abc\\"123"\nAPP_ENV=prod';
    const parsed = rawToRows(envText, "env");
    expect(parsed.error).toBeUndefined();
    expect(parsed.rows.map((r) => [r.key, r.value])).toEqual([
      ["API_KEY", 'abc"123'],
      ["APP_ENV", "prod"],
    ]);

    const converted = convertRawFormat(envText, "env", "json");
    expect(converted.error).toBeUndefined();
    expect(JSON.parse(converted.text!)).toEqual({ API_KEY: 'abc"123', APP_ENV: "prod" });

    expect(rowsToRaw([{ _id: "1", key: "GREET", value: "hello world" }], "env")).toBe('GREET="hello world"');
    expect(formatJsonText("{bad json").error).toBeTruthy();
  });
});

describe("shared/url sanitizeRichEditorUrl", () => {
  it("blocks obfuscated dangerous URL protocols while preserving safe links", () => {
    expect(sanitizeRichEditorUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("java\tscript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("\u0001vbscript:msgbox(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("&#106;avascript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(sanitizeRichEditorUrl("javascript&colon;alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("java&tab;script&colon;alert(1)")).toBeNull();

    expect(sanitizeRichEditorUrl("https://nextjs.org/docs")).toBe("https://nextjs.org/docs");
    expect(sanitizeRichEditorUrl("mailto:team@example.com")).toBe("mailto:team@example.com");
    expect(sanitizeRichEditorUrl("/dashboard/users")).toBe("/dashboard/users");
    expect(sanitizeRichEditorUrl("example.com")).toBe("https://example.com");
  });
});

describe("color-picker/colorUtils", () => {
  it("validates, normalizes, and expands HEX values cleanly", () => {
    expect(normalizeHexInput(" 3b82f6 ")).toBe("#3b82f6");
    expect(isValidHexColor("#3b82f6")).toBe(true);
    expect(isValidHexColor("#fff")).toBe(true);
    expect(isValidHexColor("#gggggg")).toBe(false);

    expect(toSixDigitHex("#09F")).toBe("#0099ff");
    expect(toSixDigitHex("#11223380")).toBe("#112233");
    expect(toSixDigitHex("invalid", "#abcdef")).toBe("#abcdef");
  });

  it("computes grid keyboard navigation targets with wrap-around", () => {
    expect(getNextPaletteIndex(0, "ArrowRight", 12, 6)).toBe(1);
    expect(getNextPaletteIndex(11, "ArrowRight", 12, 6)).toBe(0);
    expect(getNextPaletteIndex(0, "ArrowLeft", 12, 6)).toBe(11);
    expect(getNextPaletteIndex(2, "ArrowDown", 12, 6)).toBe(8);
    expect(getNextPaletteIndex(8, "ArrowUp", 12, 6)).toBe(2);
    expect(getNextPaletteIndex(2, "ArrowUp", 12, 6)).toBe(8);
    expect(getNextPaletteIndex(4, "Home", 12, 6)).toBe(0);
    expect(getNextPaletteIndex(4, "End", 12, 6)).toBe(11);
  });
});

describe("choice/treeEngine", () => {
  const sampleTree: TreeSelectNode[] = [
    {
      value: "eng",
      label: "Engineering",
      children: [
        { value: "fe", label: "Frontend" },
        { value: "be", label: "Backend", disabled: true },
      ],
    },
    {
      value: "design",
      label: "Design",
      children: [
        { value: "ui", label: "UI" },
        { value: "ux", label: "UX" },
      ],
    },
  ];

  it("resolves cascading check state, strategies, and unchecking correctly", () => {
    const { nodeMap } = buildTreeIndex(sampleTree, defaultFieldNames());
    const state = resolveCascadingCheckedState(new Set(["fe", "ui"]), nodeMap);

    // "eng" becomes full checked because its only non-disabled child is "fe"
    expect(state.checkedKeys.has("eng")).toBe(true);
    expect(state.halfCheckedKeys.has("design")).toBe(true);
    expect(state.checkedKeys.has("design")).toBe(false);

    expect(filterCheckedKeysByStrategy(state.checkedKeys, "SHOW_PARENT", nodeMap).sort()).toEqual(["eng", "ui"]);
    expect(filterCheckedKeysByStrategy(state.checkedKeys, "SHOW_CHILD", nodeMap).sort()).toEqual(["fe", "ui"]);

    const designNode = nodeMap.get("design")!;
    const afterFullDesign = applyCascadingCheckChange(state.checkedKeys, designNode, nodeMap, true);
    expect(afterFullDesign.has("design")).toBe(true);
    expect(afterFullDesign.has("ux")).toBe(true);

    const uiNode = nodeMap.get("ui")!;
    const afterUncheckUi = applyCascadingCheckChange(afterFullDesign, uiNode, nodeMap, false);
    expect(afterUncheckUi.has("ui")).toBe(false);
    expect(afterUncheckUi.has("design")).toBe(false);
  });

  it("collects cascader search paths and splits highlight segments safely", () => {
    const paths = collectCascaderSearchPaths(
      [
        {
          value: "cn",
          label: "China (CN)",
          children: [{ value: "bj", label: "Beijing.HD" }],
        },
      ],
      [],
      "(CN) / Beijing.",
      false,
    );

    expect(paths).toHaveLength(1);
    expect(paths[0]?.values).toEqual(["cn", "bj"]);

    const segments = splitHighlightSegments("Beijing (v1.2)", "(v1.");
    expect(segments).toEqual([
      { text: "Beijing ", highlighted: false },
      { text: "(v1.", highlighted: true },
      { text: "2)", highlighted: false },
    ]);
  });

  it("round-trips multiline double-quoted .env entries and escaped characters in parsers", () => {
    const rows = [
      { _id: "1", key: "PRIVATE_KEY", value: 'line1\nline2 "quoted"\r\nback\\slash' },
      { _id: "2", key: "CONN", value: "a=b c" },
    ];
    const envRaw = rowsToRaw(rows, "env");
    expect(envRaw).toContain('PRIVATE_KEY="line1\\nline2 \\"quoted\\"\\r\\nback\\\\slash"');
    const parsed = rawToRows(envRaw, "env");
    expect(parsed.error).toBeUndefined();
    expect(parsed.rows.map(({ key, value }) => ({ key, value }))).toEqual([
      { key: "PRIVATE_KEY", value: 'line1\nline2 "quoted"\r\nback\\slash' },
      { key: "CONN", value: "a=b c" },
    ]);

    const multilineQuotedEnv = 'CERT="-----BEGIN-----\nABC=123\n-----END-----"\nSIMPLE=ok';
    const parsedMultiline = rawToRows(multilineQuotedEnv, "env");
    expect(parsedMultiline.error).toBeUndefined();
    expect(parsedMultiline.rows.map(({ key, value }) => ({ key, value }))).toEqual([
      { key: "CERT", value: "-----BEGIN-----\nABC=123\n-----END-----" },
      { key: "SIMPLE", value: "ok" },
    ]);
  });

  it("formats zero, negative, NaN, and TB byte counts safely in formatBytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(-10)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
    expect(formatBytes(1024 ** 4)).toBe("1.0 TB");
    expect(formatBytes(1024 ** 5)).toBe("1024.0 TB");
  });
});
