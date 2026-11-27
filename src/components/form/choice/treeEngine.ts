export {
  collectCascaderSearchPaths,
  DEFAULT_CASCADER_FIELD_NAMES,
  getCascaderOptionChildren,
  getCascaderOptionDisplayNode,
  getCascaderOptionLabel,
  getCascaderOptionValue,
  resolveCascaderOptionsByValue,
  type CascaderFieldNames,
  type CascaderOption,
  type CascaderSearchResultItem,
} from "./cascaderEngine";
export {
  buildTreeIndex,
  defaultFieldNames,
  getNodeLabel,
  type InternalTreeNode,
  type ShowCheckedStrategy,
  type TreeSelectFieldNames,
  type TreeSelectNode,
  type TreeSelectValue,
} from "./treeSelectEngine";
export {
  applyCascadingCheckChange,
  collectMatchedTreeKeys,
  filterCheckedKeysByStrategy,
  resolveCascadingCheckedState,
} from "./treeCascade";

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/** Splits text into plain/highlighted segments via literal indexOf (immune to regex meta/ReDoS). */
export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, highlighted: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = lowerText.indexOf(lowerQuery, cursor);
    if (idx === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }
    if (idx > cursor) {
      segments.push({ text: text.slice(cursor, idx), highlighted: false });
    }
    segments.push({
      text: text.slice(idx, idx + trimmed.length),
      highlighted: true,
    });
    cursor = idx + trimmed.length;
  }

  return segments;
}
