import type { z } from "zod";

import { Collection, Query } from "@msw/data";

export type LegacyWhereValue = string | number | boolean | { equals?: unknown; in?: unknown[] };

export type LegacyWhereClause = Record<string, LegacyWhereValue>;

export interface LegacyQuery<T> {
  where?: Partial<Record<keyof T, unknown>> | Record<string, unknown>;
}

export type QueryPredicate<T> = ((query: Query<T>) => Query<unknown>) | Query<T> | LegacyQuery<T>;

export function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  for (const [key, condition] of Object.entries(where)) {
    const val = record[key];
    if (condition && typeof condition === "object") {
      if ("equals" in condition) {
        if (val !== (condition as { equals: unknown }).equals) return false;
        continue;
      }
      if ("in" in condition && Array.isArray((condition as { in: unknown[] }).in)) {
        if (!(condition as { in: unknown[] }).in.includes(val)) return false;
        continue;
      }
    }
    if (val !== condition) {
      return false;
    }
  }
  return true;
}

/**
 * Adapter over @msw/data Collection providing clean async CRUD operations
 * and backward-compatible query syntax for existing mock handlers.
 */
export class CollectionAdapter<T extends { id?: string }> {
  readonly collection: Collection<z.ZodType>;

  constructor(schema: z.ZodType) {
    this.collection = new Collection({ schema });
  }

  private toQuery(predicate?: QueryPredicate<T>): ((query: Query<T>) => Query<unknown>) | Query<T> | undefined {
    if (predicate == null) return undefined;
    if (typeof predicate === "function" || predicate instanceof Query) {
      return predicate;
    }
    if (typeof predicate === "object" && "where" in predicate && predicate.where) {
      const where = predicate.where;
      return new Query((record: unknown) =>
        matchesWhere(record as Record<string, unknown>, where),
      ) as unknown as Query<T>;
    }
    return undefined;
  }

  findFirst(predicate?: QueryPredicate<T>): T | undefined {
    return this.collection.findFirst(
      this.toQuery(predicate) as unknown as Parameters<Collection<z.ZodType>["findFirst"]>[0],
    ) as T | undefined;
  }

  findMany(predicate?: QueryPredicate<T>): T[] {
    return this.collection.findMany(
      this.toQuery(predicate) as unknown as Parameters<Collection<z.ZodType>["findMany"]>[0],
    ) as unknown as T[];
  }

  all(): T[] {
    return this.collection.all() as unknown as T[];
  }

  getAll(): T[] {
    return this.all();
  }

  count(predicate?: QueryPredicate<T>): number {
    if (predicate) {
      return this.findMany(predicate).length;
    }
    return this.collection.count();
  }

  clear(): void {
    this.collection.clear();
  }

  async create(initialValues: T): Promise<T> {
    const id = initialValues.id ?? crypto.randomUUID();
    const valuesWithId = {
      ...initialValues,
      id,
    };
    return (await this.collection.create(
      valuesWithId as Parameters<Collection<z.ZodType>["create"]>[0],
    )) as unknown as T;
  }

  async update(
    predicateOrLegacy: QueryPredicate<T> | { where: Record<string, unknown>; data: Partial<T> },
    options?: { data: Partial<T> | ((draft: T) => void) },
  ): Promise<T | undefined> {
    let targetRecord: T | undefined;
    let updatePayload: Partial<T> | ((draft: T) => void) | undefined;

    if (
      predicateOrLegacy &&
      typeof predicateOrLegacy === "object" &&
      "data" in predicateOrLegacy &&
      "where" in predicateOrLegacy
    ) {
      const legacy = predicateOrLegacy as {
        where: Record<string, unknown>;
        data: Partial<T>;
      };
      targetRecord = this.findFirst({ where: legacy.where });
      updatePayload = legacy.data;
    } else {
      targetRecord = this.findFirst(predicateOrLegacy as QueryPredicate<T>);
      updatePayload = options?.data;
    }

    if (!targetRecord) return undefined;

    if (typeof updatePayload === "function") {
      updatePayload(targetRecord);
    } else if (updatePayload && typeof updatePayload === "object") {
      Object.assign(targetRecord, updatePayload);
    }

    return targetRecord;
  }

  delete(predicateOrLegacy: QueryPredicate<T>): T | undefined {
    const targetRecord = this.findFirst(predicateOrLegacy);
    if (!targetRecord) return undefined;
    return this.collection.delete(targetRecord as unknown as Parameters<Collection<z.ZodType>["delete"]>[0]) as
      | T
      | undefined;
  }
}
