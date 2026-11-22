import type { z } from "zod";

import type { Collection, Query } from "@msw/data";
import { Collection as MswCollection } from "@msw/data";

export type QueryPredicate<T> = ((query: Query<T>) => Query<unknown>) | Query<T>;

/**
 * Typed adapter over `@msw/data` Collection using native `Query` predicates.
 */
export class CollectionAdapter<T extends { id?: string }> {
  readonly collection: Collection<z.ZodType>;

  constructor(schema: z.ZodType) {
    this.collection = new MswCollection({ schema });
  }

  findFirst(predicate?: QueryPredicate<T>): T | undefined {
    return this.collection.findFirst(predicate as unknown as Parameters<Collection<z.ZodType>["findFirst"]>[0]) as
      | T
      | undefined;
  }

  findMany(predicate?: QueryPredicate<T>): T[] {
    return this.collection.findMany(
      predicate as unknown as Parameters<Collection<z.ZodType>["findMany"]>[0],
    ) as unknown as T[];
  }

  all(): T[] {
    return this.collection.all() as unknown as T[];
  }

  getAll(): T[] {
    return this.all();
  }

  count(predicate?: QueryPredicate<T>): number {
    return predicate ? this.findMany(predicate).length : this.collection.count();
  }

  clear(): void {
    this.collection.clear();
  }

  async create(initialValues: T): Promise<T> {
    const id = initialValues.id ?? crypto.randomUUID();
    return (await this.collection.create({
      ...initialValues,
      id,
    } as Parameters<Collection<z.ZodType>["create"]>[0])) as unknown as T;
  }

  async update(
    predicate: QueryPredicate<T>,
    options: { data: Partial<T> | ((draft: T) => void) },
  ): Promise<T | undefined> {
    const targetRecord = this.findFirst(predicate);
    if (!targetRecord) return undefined;

    if (typeof options.data === "function") {
      options.data(targetRecord);
    } else if (options.data && typeof options.data === "object") {
      Object.assign(targetRecord, options.data);
    }

    return targetRecord;
  }

  delete(predicate: QueryPredicate<T>): T | undefined {
    const targetRecord = this.findFirst(predicate);
    if (!targetRecord) return undefined;
    return this.collection.delete(targetRecord as unknown as Parameters<Collection<z.ZodType>["delete"]>[0]) as
      | T
      | undefined;
  }
}
