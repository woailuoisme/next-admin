let keySeq = 0;

export function generateUniqueRepeaterKey(): string {
  keySeq += 1;
  return `rep-${Date.now()}-${keySeq}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 基于 WeakMap 维护无主键对象的稳定 React key（绝不读取可编辑字段 `item.key`），
 * 并在 `updateItem` 生成新对象引用时无缝迁移 key，杜绝击键失焦或等长替换错乱。
 */
export const repeaterObjectKeyRegistry = new WeakMap<object, string>();

export function getExplicitObjectId(item: unknown): string | null {
  if (typeof item !== "object" || item === null) return null;
  const rec = item as Record<string, unknown>;
  if (rec.id !== undefined && rec.id !== null && rec.id !== "") return String(rec.id);
  if (rec._id !== undefined && rec._id !== null && rec._id !== "") return String(rec._id);
  return null;
}

export function getOrAssignObjectKey(obj: object): string {
  const existing = repeaterObjectKeyRegistry.get(obj);
  if (existing) return existing;
  const assigned = generateUniqueRepeaterKey();
  repeaterObjectKeyRegistry.set(obj, assigned);
  return assigned;
}

export function resolveRepeaterItemKey<T>(
  item: T,
  index: number,
  getItemKey?: (item: T, index: number) => string,
  primitiveKeys?: readonly string[],
): string {
  if (getItemKey) return getItemKey(item, index);
  const explicitId = getExplicitObjectId(item);
  if (explicitId) return explicitId;
  if (typeof item === "object" && item !== null) return getOrAssignObjectKey(item);
  return primitiveKeys?.[index] ?? `rep-prim-${index}`;
}

export function cloneRepeaterItem<T>(target: T, cloneItem?: (item: T) => T): T {
  let cloned: T;
  const hasCustomClone = typeof cloneItem === "function";
  if (hasCustomClone) {
    cloned = cloneItem(target);
  } else if (typeof structuredClone === "function") {
    try {
      cloned = structuredClone(target);
    } catch {
      cloned =
        typeof target === "object" && target !== null ? ({ ...(target as Record<string, unknown>) } as T) : target;
    }
  } else {
    cloned = JSON.parse(JSON.stringify(target));
  }

  if (typeof cloned === "object" && cloned !== null) {
    if (!hasCustomClone && !Array.isArray(cloned)) {
      cloned = {
        ...(cloned as Record<string, unknown>),
        ...("id" in cloned ? { id: generateUniqueRepeaterKey() } : {}),
        ...("_id" in cloned ? { _id: generateUniqueRepeaterKey() } : {}),
      } as T;
    }
    if (!getExplicitObjectId(cloned)) {
      repeaterObjectKeyRegistry.set(cloned as object, generateUniqueRepeaterKey());
    }
  }

  return cloned;
}
