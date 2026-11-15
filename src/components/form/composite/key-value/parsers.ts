import type { KeyValuePair } from "../../core";
import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

const DOUBLE_QUOTE_REGEX = /"/g;
const ESCAPED_QUOTE_REGEX = /\\"/g;
const ENV_SPECIAL_CHAR_REGEX = /[\s"'\n]/;

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
        return `${k}="${v.replace(DOUBLE_QUOTE_REGEX, '\\"')}"`;
      }
      return `${k}=${v}`;
    })
    .join("\n");
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

  // .env format
  const lines = rawText.split("\n");
  const rows: KeyValueRowItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIdx = line.indexOf("=");
    if (eqIdx === -1) {
      rows.push(createKvRow(line, ""));
    } else {
      const k = line.slice(0, eqIdx).trim();
      let v = line.slice(eqIdx + 1).trim();

      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1).replace(ESCAPED_QUOTE_REGEX, '"');
      }
      rows.push(createKvRow(k, v));
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
