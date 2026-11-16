import type { KeyValuePair } from "../../core";
import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

const BACKSLASH_REGEX = /\\/g;
const CR_REGEX = /\r/g;
const LF_REGEX = /\n/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const ENV_DOUBLE_QUOTE_UNESCAPE_REGEX = /\\([\\nr"])/g;
const ENV_SPECIAL_CHAR_REGEX = /[\s"'#\r\n\\=]/;

let kvRowIdCounter = 0;

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
 * 增量对账已有行集合与外部传入值：尽可能保留原有行的 `_id`，避免组件重建与输入框失焦。
 */
export function reconcileKvRows(prevRows: KeyValueRowItem[], incomingValue: unknown): KeyValueRowItem[] {
  const nextPairs = toIncomingPairs(incomingValue);
  if (nextPairs.length === 0) return [];

  const isArrayInput = Array.isArray(incomingValue);
  const usedPrevIndices = new Set<number>();

  const reconciled = nextPairs.map((pair, idx) => {
    // 数组模式下优先按同索引对齐，对象模式下优先按同名 key 对齐
    if (isArrayInput && prevRows[idx] && !usedPrevIndices.has(idx)) {
      usedPrevIndices.add(idx);
      const prev = prevRows[idx]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    const matchedByKey = prevRows.findIndex((prev, prevIdx) => !usedPrevIndices.has(prevIdx) && prev.key === pair.key);
    if (matchedByKey !== -1) {
      usedPrevIndices.add(matchedByKey);
      const prev = prevRows[matchedByKey]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    if (prevRows[idx] && !usedPrevIndices.has(idx)) {
      usedPrevIndices.add(idx);
      const prev = prevRows[idx]!;
      return { ...prev, key: pair.key, value: pair.value };
    }

    return createKvRow(pair.key, pair.value);
  });

  return markDuplicateRows(reconciled);
}

export function rowsToRecord(rows: KeyValueRowItem[]): Record<string, string> {
  const rec: Record<string, string> = {};
  for (const r of rows) {
    const trimmedKey = r.key.trim();
    if (trimmedKey !== "") {
      rec[trimmedKey] = r.value;
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

export function markDuplicateRows(rows: KeyValueRowItem[]): KeyValueRowItem[] {
  const dupes = findDuplicateKeys(rows);
  if (dupes.size === 0) {
    const hasAnyDuplicateMarked = rows.some((r) => r.isDuplicate);
    if (!hasAnyDuplicateMarked) return rows;
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

  // .env format: KEY=VALUE
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

export function rawToRows(rawText: string, format: KeyValueRawFormat): { rows: KeyValueRowItem[]; error?: string } {
  if (format === "json") {
    try {
      if (!rawText.trim()) {
        return { rows: [] };
      }
      const parsed = JSON.parse(rawText);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { rows: [], error: "JSON must be an object literal ({ key: value })" };
      }
      const rows = Object.entries(parsed).map(([k, v]) =>
        createKvRow(k, typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")),
      );
      return { rows: markDuplicateRows(rows) };
    } catch (err) {
      return { rows: [], error: (err as Error).message || "Invalid JSON syntax" };
    }
  }

  // .env format (supports single-line & multiline double-quoted entries + escaped \n/\r/\"/\\)
  const lines = rawText.split(/\r?\n/);
  const rows: KeyValueRowItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) {
      rows.push(createKvRow(line, ""));
      continue;
    }

    const k = line.slice(0, eqIdx).trim();
    const afterEq = line.slice(eqIdx + 1).trim();

    if (afterEq.startsWith('"')) {
      let body = afterEq.slice(1);
      const hasClosingQuote = (segment: string) => {
        let trailingBackslashes = 0;
        for (let idx = segment.length - 1; idx >= 0 && segment[idx] === "\\"; idx--) {
          trailingBackslashes += 1;
        }
        return segment.endsWith('"') && trailingBackslashes % 2 === 0;
      };

      while (!hasClosingQuote(body) && i + 1 < lines.length) {
        i += 1;
        body += `\n${lines[i] ?? ""}`;
      }

      const trimmedBody = body.trimEnd();
      if (hasClosingQuote(trimmedBody)) {
        rows.push(createKvRow(k, unescapeEnvDoubleQuoted(trimmedBody.slice(0, -1))));
      } else {
        rows.push(createKvRow(k, unescapeEnvDoubleQuoted(body)));
      }
    } else if (afterEq.startsWith("'") && afterEq.endsWith("'") && afterEq.length >= 2) {
      rows.push(createKvRow(k, afterEq.slice(1, -1)));
    } else {
      rows.push(createKvRow(k, afterEq));
    }
  }

  return { rows: markDuplicateRows(rows) };
}

export function formatJsonText(rawText: string): { formatted?: string; error?: string } {
  try {
    const parsed = JSON.parse(rawText);
    return { formatted: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { error: (err as Error).message || "Invalid JSON" };
  }
}

export function convertRawFormat(
  rawText: string,
  fromFormat: KeyValueRawFormat,
  toFormat: KeyValueRawFormat,
): { text?: string; rows?: KeyValueRowItem[]; error?: string } {
  const { rows, error } = rawToRows(rawText, fromFormat);
  if (error) {
    return { error };
  }
  return {
    rows,
    text: rowsToRaw(rows, toFormat),
  };
}
