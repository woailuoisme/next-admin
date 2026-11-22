import type { ReactNode } from "react";

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface CascaderOption {
  value?: string | number;
  label?: ReactNode;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  title?: string;
  [key: string]: unknown;
}

export interface CascaderSearchResultItem {
  path: CascaderOption[];
  labels: string[];
  values: (string | number)[];
  disabled: boolean;
}

export const DEFAULT_CASCADER_FIELD_NAMES: Required<CascaderFieldNames> = {
  label: "label",
  value: "value",
  children: "children",
};

/** Reads a cascader option value respecting custom fieldNames. */
export function getCascaderOptionValue(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): string | number {
  return (option[fieldNames.value] ?? option.value ?? "") as string | number;
}

/** Reads a cascader option string label respecting custom fieldNames. */
export function getCascaderOptionLabel(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): string {
  const raw = option[fieldNames.label] ?? option.label ?? "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return "";
}

/** Reads cascader child options respecting custom fieldNames. */
export function getCascaderOptionChildren(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderOption[] | undefined {
  return (option[fieldNames.children] ?? option.children) as CascaderOption[] | undefined;
}

/** Resolves an array of option objects matching a sequence of path values. */
export function resolveCascaderOptionsByValue(
  options: CascaderOption[],
  pathValues?: (string | number)[],
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderOption[] {
  if (!pathValues || pathValues.length === 0) return [];
  const result: CascaderOption[] = [];
  let currentLevelOptions: CascaderOption[] | undefined = options;

  for (const val of pathValues) {
    if (!currentLevelOptions) break;
    const match: CascaderOption | undefined = currentLevelOptions.find(
      (opt) => String(getCascaderOptionValue(opt, fieldNames)) === String(val),
    );
    if (!match) break;
    result.push(match);
    currentLevelOptions = getCascaderOptionChildren(match, fieldNames);
  }

  return result;
}

/** Traverses cascader options recursively to collect all paths matching a search query. */
export function collectCascaderSearchPaths(
  options: CascaderOption[],
  currentPath: CascaderOption[] = [],
  query: string,
  changeOnSelect: boolean,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): CascaderSearchResultItem[] {
  const results: CascaderSearchResultItem[] = [];
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return results;

  for (const option of options) {
    const nextPath = [...currentPath, option];
    const children = getCascaderOptionChildren(option, fieldNames);
    const isLeaf = Boolean(
      option.isLeaf === true ||
      (!children && option.isLeaf !== false) ||
      (children && children.length === 0 && option.isLeaf !== false),
    );

    const pathLabels = nextPath.map((o) => getCascaderOptionLabel(o, fieldNames));
    const fullText = pathLabels.join(" / ").toLowerCase();

    if (fullText.includes(lowerQuery) && (changeOnSelect || isLeaf)) {
      results.push({
        path: nextPath,
        labels: pathLabels,
        values: nextPath.map((o) => getCascaderOptionValue(o, fieldNames)),
        disabled: nextPath.some((o) => Boolean(o.disabled)),
      });
    }

    if (children && children.length > 0) {
      results.push(...collectCascaderSearchPaths(children, nextPath, query, changeOnSelect, fieldNames));
    }
  }

  return results;
}
