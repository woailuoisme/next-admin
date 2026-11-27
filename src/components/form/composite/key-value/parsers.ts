import type { KeyValuePair } from "@/components/form/core";

import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

const BACKSLASH_REGEX = /\\/g;
const CR_REGEX = /\r/g;
const LF_REGEX = /\n/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const ENV_DOUBLE_QUOTE_UNESCAPE_REGEX = /\\([\\nr"])/g;
const ENV_SPECIAL_CHAR_REGEX = /[\s"'#\r\n\\=]/;

let kvRowIdCounter = 0;

export interface RawParseErrorDescriptor {
  key:
    | "keyvalue_raw_invalid_object"
    | "keyvalue_raw_invalid_json"
    | "keyvalue_raw_invalid_env_line"
    | "keyvalue_raw_empty_env_key";
  params?: Record<string, string | number>;
}

export function createKvRow(key = "", value = ""): KeyValueRowItem {
  kvRowIdCounter += 1;
  return {
    _id: `kv-${Date.now()}-${kvRowIdCounter}-${Math.random().toString(36).slice(2, 6)}`,
    key,
    value,
  };
}

function toIncomingPairs(val: unknown): KeyValuePair[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === "object" && item !== null && "key" in item) {
        const pair = item as KeyValuePair;
        return { key: String(pair.key ?? ""), value: String(pair.value ?? "") };
      }
      return { key: "", value: String(item ?? "") };
    });
  }
  if (typeof val === "object") {
    return Object.entries(val).map(([k, v]) => ({ key: k, value: String(v ?? "") }));
  }
  return [];
}

export function parseToRows(val: unknown): KeyValueRowItem[] {
  return toIncomingPairs(val).map((pair) => createKvRow(pair.key, pair.value));
}

/**
 * 增量对账已有行集合与外部传入值：O(N) 查找，尽可能保留原有行的 `_id`，避免组件重建与输入框失焦。
 */
export function reconcileKvRows(
  prevRows: KeyValueRowItem[],
  incomingValue: unknown,
  allowDuplicateKeys = false,
): KeyValueRowItem[] {
  const nextPairs = toIncomingPairs(incomingValue);
  if (nextPairs.length === 0) return [];

  const isArrayInput = Array.isArray(incomingValue);
  const usedPrevIndices = new Set<number>();

  const indicesByKey = new Map<string, number[]>();
  for (let idx = 0; idx < prevRows.length; idx++) {
    const key = prevRows[idx]!.key;
    const queue = indicesByKey.get(key);
    if (queue) queue.push(idx);
    else indicesByKey.set(key, [idx]);
  }

  const takeUnusedByKey = (key: string): number => {
    const queue = indicesByKey.get(key);
    if (!queue) return -1;
    while (queue.length > 0) {
      const candidate = queue.shift()!;
      if (!usedPrevIndices.has(candidate)) {
        return candidate;
      }
    }
    return -1;
  };

  const reconciled = nextPairs.map((pair, idx) => {
    if (isArrayInput && prevRows[idx] && !usedPrevIndices.has(idx)) {
      usedPrevIndices.add(idx);
      const prev = prevRows[idx]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    const matchedIdx = takeUnusedByKey(pair.key);
    if (matchedIdx !== -1) {
      usedPrevIndices.add(matchedIdx);
      const prev = prevRows[matchedIdx]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    if (prevRows[idx] && !usedPrevIndices.has(idx)) {
      usedPrevIndices.add(idx);
      const prev = prevRows[idx]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    return createKvRow(pair.key, pair.value);
  });

  return allowDuplicateKeys ? clearDuplicateFlags(reconciled) : markDuplicateRows(reconciled);
}

export function rowsToRecord(rows: KeyValueRowItem[]): Record<string, string> {
  const rec: Record<string, string> = {};
  for (const r of rows) {
    const trimmedKey = r.key.trim();
    if (trimmedKey !== "") {
      Object.defineProperty(rec, trimmedKey, {
        value: r.value,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  }
  return rec;
}

export function rowsToPairs(rows: KeyValueRowItem[]): KeyValuePair[] {
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
  }));
}

export function findDuplicateKeys(rows: KeyValueRowItem[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const r of rows) {
    const trimmed = r.key.trim();
    if (trimmed !== "") {
      if (seen.has(trimmed)) {
        duplicates.add(trimmed);
      } else {
        seen.add(trimmed);
      }
    }
  }
  return duplicates;
}

export function clearDuplicateFlags(rows: KeyValueRowItem[]): KeyValueRowItem[] {
  if (!rows.some((r) => r.isDuplicate)) return rows;
  return rows.map((r) => (r.isDuplicate ? { ...r, isDuplicate: false } : r));
}

export function markDuplicateRows(rows: KeyValueRowItem[]): KeyValueRowItem[] {
  const dupes = findDuplicateKeys(rows);
  if (dupes.size === 0) {
    return clearDuplicateFlags(rows);
  }
  return rows.map((r) => {
    const trimmed = r.key.trim();
    const isDuplicate = trimmed !== "" && dupes.has(trimmed);
    return r.isDuplicate === isDuplicate ? r : { ...r, isDuplicate };
  });
}

export function rowsToRaw(rows: KeyValueRowItem[], format: KeyValueRawFormat): string {
  if (format === "json") {
    return JSON.stringify(rowsToRecord(rows), null, 2);
  }

  return rows
    .filter((r) => r.key.trim() !== "")
    .map((r) => {
      const k = r.key.trim();
      const v = r.value;
      if (ENV_SPECIAL_CHAR_REGEX.test(v)) {
        const escaped = v
          .replace(BACKSLASH_REGEX, "\\\\")
          .replace(CR_REGEX, "\\r")
          .replace(LF_REGEX, "\\n")
          .replace(DOUBLE_QUOTE_REGEX, '\\"');
        return `${k}="${escaped}"`;
      }
      return `${k}=${v}`;
    })
    .join("\n");
}

function unescapeEnvDoubleQuoted(raw: string): string {
  return raw.replace(ENV_DOUBLE_QUOTE_UNESCAPE_REGEX, (_, token: string) => {
    if (token === "n") return "\n";
    if (token === "r") return "\r";
    return token;
  });
}

/**
 * Finds a closing quote index in a `.env` value body, ensuring the rest of the line is whitespace or `# comment`.
 */
function findClosingQuote(segment: string, quoteChar: '"' | "'"): { content: string; closed: boolean } {
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (quoteChar === '"' && ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === quoteChar) {
      const trailing = segment.slice(i + 1).trim();
      if (trailing === "" || trailing.startsWith("#")) {
        return { content: segment.slice(0, i), closed: true };
      }
    }
  }
  return { content: segment, closed: false };
}

function stripInlineComment(value: string): string {
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "#" && (i === 0 || /\s/.test(value[i - 1]!))) {
      return value.slice(0, i).trimEnd();
    }
  }
  return value.trimEnd();
}

export function rawToRows(
  rawText: string,
  format: KeyValueRawFormat,
  allowDuplicateKeys = false,
): { rows: KeyValueRowItem[]; error?: string; errorDescriptor?: RawParseErrorDescriptor } {
  if (format === "json") {
    try {
      if (!rawText.trim()) {
        return { rows: [] };
      }
      const parsed = JSON.parse(rawText);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return {
          rows: [],
          error: "JSON must be an object literal ({ key: value })",
          errorDescriptor: { key: "keyvalue_raw_invalid_object" },
        };
      }
      const rows = Object.entries(parsed).map(([k, v]) =>
        createKvRow(k, typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")),
      );
      return { rows: allowDuplicateKeys ? clearDuplicateFlags(rows) : markDuplicateRows(rows) };
    } catch (err) {
      return {
        rows: [],
        error: (err as Error).message || "Invalid JSON syntax",
        errorDescriptor: { key: "keyvalue_raw_invalid_json" },
      };
    }
  }

  const lines = rawText.split(/\r?\n/);
  const rows: KeyValueRowItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) {
      return {
        rows: [],
        error: `Line ${i + 1} is missing '='`,
        errorDescriptor: { key: "keyvalue_raw_invalid_env_line", params: { line: i + 1 } },
      };
    }

    const k = line.slice(0, eqIdx).trim();
    if (!k) {
      return {
        rows: [],
        error: `Line ${i + 1} has an empty key`,
        errorDescriptor: { key: "keyvalue_raw_empty_env_key", params: { line: i + 1 } },
      };
    }

    const afterEq = line.slice(eqIdx + 1).trim();

    if (afterEq.startsWith('"') || afterEq.startsWith("'")) {
      const quoteChar = afterEq[0] as '"' | "'";
      let body = afterEq.slice(1);
      let resolved = findClosingQuote(body, quoteChar);
      while (!resolved.closed && i + 1 < lines.length) {
        i += 1;
        body += `\n${lines[i] ?? ""}`;
        resolved = findClosingQuote(body, quoteChar);
      }
      const rawContent = resolved.closed ? resolved.content : body;
      rows.push(createKvRow(k, quoteChar === '"' ? unescapeEnvDoubleQuoted(rawContent) : rawContent));
    } else {
      rows.push(createKvRow(k, stripInlineComment(afterEq)));
    }
  }

  return { rows: allowDuplicateKeys ? clearDuplicateFlags(rows) : markDuplicateRows(rows) };
}

export function formatJsonText(rawText: string): {
  formatted?: string;
  error?: string;
  errorDescriptor?: RawParseErrorDescriptor;
} {
  try {
    const parsed = JSON.parse(rawText);
    return { formatted: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return {
      error: (err as Error).message || "Invalid JSON",
      errorDescriptor: { key: "keyvalue_raw_invalid_json" },
    };
  }
}

export function convertRawFormat(
  rawText: string,
  fromFormat: KeyValueRawFormat,
  toFormat: KeyValueRawFormat,
  allowDuplicateKeys = false,
): { text?: string; rows?: KeyValueRowItem[]; error?: string; errorDescriptor?: RawParseErrorDescriptor } {
  const { rows, error, errorDescriptor } = rawToRows(rawText, fromFormat, allowDuplicateKeys);
  if (error) {
    return { error, errorDescriptor };
  }
  return {
    rows,
    text: rowsToRaw(rows, toFormat),
  };
}
