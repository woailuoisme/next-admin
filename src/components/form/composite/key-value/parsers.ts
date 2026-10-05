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

export function parseToRows(val: unknown): KeyValueRowItem[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === "object" && item !== null && "key" in item) {
        const pair = item as KeyValuePair;
        return createKvRow(String(pair.key ?? ""), String(pair.value ?? ""));
      }
      return createKvRow("", String(item ?? ""));
    });
  }
  if (typeof val === "object") {
    return Object.entries(val).map(([k, v]) => createKvRow(k, String(v ?? "")));
  }
  return [];
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

export function rawToRows(
  rawText: string,
  format: KeyValueRawFormat,
): { rows: KeyValueRowItem[]; error?: string } {
  if (format === "json") {
    try {
      if (!rawText.trim()) {
        return { rows: [] };
      }
      const parsed = JSON.parse(rawText);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { rows: [], error: "JSON 格式必须为对象字面量（{ key: value }）" };
      }
      const rows = Object.entries(parsed).map(([k, v]) =>
        createKvRow(k, typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")),
      );
      return { rows: markDuplicateRows(rows) };
    } catch (err) {
      return { rows: [], error: (err as Error).message || "JSON 语法错误" };
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

      // Strip outer matching quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1).replace(ESCAPED_QUOTE_REGEX, '"');
      }
      rows.push(createKvRow(k, v));
    }
  }

  return { rows: markDuplicateRows(rows) };
}
