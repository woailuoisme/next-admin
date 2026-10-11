/**
 * Utilities for column builders to resolve static or row-dependent properties.
 */

/**
 * Resolves a prop that can be either a static value or a function receiving the row.
 */
export function resolveProp<T, R, F = R>(prop: R | ((row: T) => F) | undefined, row: T): R | F | undefined {
  return typeof prop === "function" ? (prop as (row: T) => F)(row) : prop;
}

/**
 * Resolves a function-only callback prop that accepts the row.
 */
export function resolveFn<T, R>(fn: ((row: T) => R) | undefined, row: T): R | undefined {
  return fn ? fn(row) : undefined;
}
