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

/** Reads a cascader option string label respecting custom fieldNames and title fallback. */
export function getCascaderOptionLabel(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): string {
  const raw = option[fieldNames.label] ?? option.label ?? option.title ?? "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (typeof option.title === "string") return option.title;
  return "";
}

/** Reads the renderable ReactNode label for a cascader option. */
export function getCascaderOptionDisplayNode(
  option: CascaderOption,
  fieldNames: Required<CascaderFieldNames> = DEFAULT_CASCADER_FIELD_NAMES,
): ReactNode {
  const raw = option[fieldNames.label] ?? option.label ?? option.title;
  if (raw !== undefined && raw !== null) return raw as ReactNode;
  return String(getCascaderOptionValue(option, fieldNames));
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
  separator = " / ",
): CascaderSearchResultItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const results: CascaderSearchResultItem[] = [];

  function walk(list: CascaderOption[], pathPrefix: CascaderOption[], labelPrefix: string[]) {
    for (const option of list) {
      const nextPath = [...pathPrefix, option];
      const nextLabels = [...labelPrefix, getCascaderOptionLabel(option, fieldNames)];
      const children = getCascaderOptionChildren(option, fieldNames);
      const isLeaf = Boolean(
        option.isLeaf === true ||
        (!children && option.isLeaf !== false) ||
        (children && children.length === 0 && option.isLeaf !== false),
      );

      const fullText = nextLabels.join(separator).toLowerCase();
      if (fullText.includes(lowerQuery) && (changeOnSelect || isLeaf)) {
        results.push({
          path: nextPath,
          labels: nextLabels,
          values: nextPath.map((o) => getCascaderOptionValue(o, fieldNames)),
          disabled: nextPath.some((o) => Boolean(o.disabled)),
        });
      }

      if (children && children.length > 0) {
        walk(children, nextPath, nextLabels);
      }
    }
  }

  const initialLabels = currentPath.map((o) => getCascaderOptionLabel(o, fieldNames));
  walk(options, currentPath, initialLabels);

  return results;
}
