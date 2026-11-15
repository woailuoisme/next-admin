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
import {
  itemFileValueCodec,
  matchesAccept,
  mergeUploadedItems,
  urlFileValueCodec,
  validateCandidateFiles,
} from "@/components/form/media/file-upload/pipeline";
import type { FileUploadItem } from "@/components/form/media/file-upload/types";
import {
  escapeHtml,
  htmlRichEditorCodec,
  sanitizeRichEditorUrl,
  simpleHtmlToMarkdown,
  simpleMarkdownToHtml,
} from "@/components/form/media/rich-editor/converters";

describe("file-upload/pipeline", () => {
  it("isolates uploading and error items in urlFileValueCodec", () => {
    const items: FileUploadItem[] = [
      { id: "1", name: "a.png", url: "https://cdn.example.com/a.png", status: "done" },
      { id: "2", name: "b.png", url: "blob:pending", status: "uploading", progress: 40 },
      { id: "3", name: "c.png", url: "https://cdn.example.com/c.png", status: "error", error: "fail" },
    ];

    expect(urlFileValueCodec.encode(items, "grid")).toEqual(["https://cdn.example.com/a.png"]);
    expect(urlFileValueCodec.encode(items, "avatar")).toBe("https://cdn.example.com/a.png");
    expect(itemFileValueCodec.encode(items, "grid")).toHaveLength(3);
    expect(itemFileValueCodec.encode(items, "avatar")).toEqual(items[0]);
  });

  it("validates candidate files by accept, maxSize, and maxFiles slots", () => {
    const validImg = new File(["img"], "photo.png", { type: "image/png" });
    const secondImg = new File(["img2"], "photo2.png", { type: "image/png" });
    const badType = new File(["txt"], "notes.txt", { type: "text/plain" });
    const tooLarge = new File([new Uint8Array(2048)], "huge.jpg", { type: "image/jpeg" });

    expect(matchesAccept(validImg, "image/*,.pdf")).toBe(true);
    expect(matchesAccept(badType, "image/*,.pdf")).toBe(false);

    const res = validateCandidateFiles([badType, tooLarge, validImg, secondImg], {
      accept: "image/*",
      maxSize: 1024,
      maxFiles: 2,
      currentCount: 1,
      mode: "grid",
      multiple: true,
    });

    expect(res.accepted).toEqual([validImg]);
    expect(res.rejected.map((r) => r.reason)).toEqual(["type", "size", "limit"]);
  });

  it("merges concurrent item updates immutably by target id", () => {
    const initial: FileUploadItem[] = [
      { id: "f1", name: "1.png", url: "", status: "uploading", progress: 20 },
      { id: "f2", name: "2.png", url: "", status: "uploading", progress: 50 },
    ];

    const step1 = mergeUploadedItems(initial, "f2", { status: "done", url: "/2.png", progress: 100 });
    expect(step1[0]?.status).toBe("uploading");
    expect(step1[1]).toMatchObject({ status: "done", url: "/2.png", progress: 100 });

    const missing = mergeUploadedItems(step1, "removed-id", { status: "done" });
    expect(missing).toBe(step1);
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

describe("rich-editor/converters", () => {
  it("blocks obfuscated dangerous URL protocols while preserving safe links", () => {
    expect(sanitizeRichEditorUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("java\tscript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("\u0001vbscript:msgbox(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("&#106;avascript:alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("data:text/html,<script>alert(1)</script>")).toBeNull();

    expect(sanitizeRichEditorUrl("https://nextjs.org/docs")).toBe("https://nextjs.org/docs");
    expect(sanitizeRichEditorUrl("mailto:team@example.com")).toBe("mailto:team@example.com");
    expect(sanitizeRichEditorUrl("/dashboard/users")).toBe("/dashboard/users");
    expect(sanitizeRichEditorUrl("example.com")).toBe("https://example.com");
  });

  it("escapes inline HTML and strips unsafe markdown link hrefs", () => {
    expect(escapeHtml('<script>"test"</script>')).toBe("&lt;script&gt;&quot;test&quot;&lt;/script&gt;");

    const html = simpleMarkdownToHtml(
      "## Hello <img onerror=alert(1)>\n- [bad](javascript:alert(1)) & [good](https://example.com)",
    );
    expect(html).not.toContain("<img");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('<a href="https://example.com">good</a>');
    expect(html).toContain("&lt;img onerror=alert(1)&gt;");

    const md = simpleHtmlToMarkdown('<p><a href="javascript:alert(1)">Click</a> and <strong>bold</strong></p>');
    expect(md).not.toContain("javascript:");
    expect(md).toContain("Click and **bold**");
  });

  it("preserves markdown link URLs with asterisks/tildes and sanitizes dangerous rich HTML", () => {
    const htmlWithStarUrl = simpleMarkdownToHtml(
      "See [docs](https://example.com/a*b*c~~d~~) and **bold** with `code*raw*`",
    );
    expect(htmlWithStarUrl).toContain('<a href="https://example.com/a*b*c~~d~~">docs</a>');
    expect(htmlWithStarUrl).toContain("<strong>bold</strong>");
    expect(htmlWithStarUrl).toContain("<code>code*raw*</code>");

    const dirtyHtml =
      '<p onclick="alert(1)">Hello</p><script>alert(1)</script><a href="javascript:alert(1)">Bad</a><img src="data:text/html,xss" onerror=alert(1) />';
    const cleanDecoded = htmlRichEditorCodec.decode(dirtyHtml);
    expect(cleanDecoded).not.toContain("<script");
    expect(cleanDecoded).not.toContain("onclick");
    expect(cleanDecoded).not.toContain("onerror");
    expect(cleanDecoded).not.toContain("javascript:");
    expect(cleanDecoded).not.toContain("data:text/html");
    expect(cleanDecoded).toContain("Hello");

    const cleanEncoded = htmlRichEditorCodec.encode(dirtyHtml, false);
    expect(cleanEncoded).not.toContain("<script");
    expect(cleanEncoded).not.toContain("javascript:");

    // Bypass vectors: slash-separated event handlers, nested tag reconstruction, named entities, and single-quoted href
    expect(sanitizeRichEditorUrl("javascript&colon;alert(1)")).toBeNull();
    expect(sanitizeRichEditorUrl("java&tab;script&colon;alert(1)")).toBeNull();

    const obfuscatedHtml =
      '<img/onerror=alert(1) src="https://example.com/a.png"><scr<script></script>ipt>alert(1)</script><p>Safe</p>';
    const decodedObfuscated = htmlRichEditorCodec.decode(obfuscatedHtml);
    expect(decodedObfuscated).not.toContain("onerror");
    expect(decodedObfuscated).not.toContain("<script");
    expect(decodedObfuscated).not.toContain("alert(1)");
    expect(decodedObfuscated).toContain('src="https://example.com/a.png"');
    expect(decodedObfuscated).toContain("<p>Safe</p>");

    const singleQuotedMd = simpleHtmlToMarkdown(
      "<a href='https://example.com/ok'>Good</a> and <a href='javascript:alert(1)'>Bad</a>",
    );
    expect(singleQuotedMd).toContain("[Good](https://example.com/ok)");
    expect(singleQuotedMd).not.toContain("javascript:");
    expect(singleQuotedMd).toContain("and Bad");
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
});
