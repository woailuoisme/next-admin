"use client";

import { useSelector } from "@tanstack/react-form";
import { isEqual } from "es-toolkit";
import { useEffect, useRef } from "react";

import type { BaseFormInstance } from "../types";

export interface UseFormHostSyncOptions<TData = Record<string, unknown>> {
  /** Whether the host container is currently active/open (defaults to true for page mode). */
  open?: boolean;
  /** Bound TanStack Form instance (or mock compatible with BaseFormInstance). */
  form?: BaseFormInstance;
  /** Entity record being edited or initialized. */
  entity?: TData | null;
  /** Asynchronous or default fallback values; takes precedence over raw entity fields. */
  defaultValues?: Record<string, unknown>;
  /** Explicit external dirty flag. */
  isDirtyProp?: boolean;
}

const FALLBACK_DIRTY_STORE = {
  get: () => ({ isDirty: false }),
  subscribe: () => ({ unsubscribe: () => {} }),
};

function readEntityId(entity: unknown): unknown {
  if (entity && typeof entity === "object") {
    const record = entity as Record<string, unknown>;
    return record.id ?? record._id ?? undefined;
  }
  return entity;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function mergeDefinedValues(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const next = { ...target };
  for (const [key, val] of Object.entries(source)) {
    if (val === undefined) continue;
    const existing = next[key];
    next[key] = isPlainRecord(existing) && isPlainRecord(val) ? mergeDefinedValues(existing, val) : val;
  }
  return next;
}

/**
 * Shared synchronization & reactive dirty-state hook used by both FormDialog and ResourceFormPage.
 * Keeps `entity`, `defaultValues` (with `defaultValues` precedence), and `form.reset` in sync
 * across modal open cycles, form swaps, and async entity/default updates.
 */
export function useFormHostSync<TData = Record<string, unknown>>({
  open = true,
  form,
  entity,
  defaultValues,
  isDirtyProp = false,
}: UseFormHostSyncOptions<TData>): { isFormDirty: boolean } {
  const storeSource = form?.store ?? FALLBACK_DIRTY_STORE;
  const storeIsDirty = useSelector(storeSource, (state) => Boolean(state?.isDirty));
  const isFormDirty = Boolean(isDirtyProp || storeIsDirty || form?.state?.isDirty);

  const prevOpenRef = useRef(false);
  const prevFormRef = useRef<unknown>(undefined);
  const prevEntityRef = useRef<unknown>(undefined);
  const prevEntityIdRef = useRef<unknown>(undefined);
  const prevDefaultsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const baseDefaultsRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    if (!form) return;

    const formChanged = prevFormRef.current !== form;
    if (formChanged) {
      const formDefaults = form.options?.defaultValues;
      baseDefaultsRef.current =
        formDefaults && typeof formDefaults === "object" ? { ...(formDefaults as Record<string, unknown>) } : {};
      prevFormRef.current = form;
      prevOpenRef.current = false;
      prevEntityRef.current = undefined;
      prevEntityIdRef.current = undefined;
      prevDefaultsRef.current = undefined;
    }

    if (!open) {
      prevOpenRef.current = false;
      prevEntityRef.current = undefined;
      prevEntityIdRef.current = undefined;
      prevDefaultsRef.current = undefined;
      return;
    }

    const isClean = !(form.store?.get()?.isDirty || form.state?.isDirty);
    const currentEntityId = readEntityId(entity);
    const justActivated = !prevOpenRef.current && open;
    const entityChanged =
      currentEntityId !== undefined
        ? prevEntityIdRef.current !== currentEntityId || (isClean && !isEqual(prevEntityRef.current, entity))
        : entity !== undefined && !isEqual(prevEntityRef.current, entity);
    const defaultsArrivedClean = isClean && !isEqual(prevDefaultsRef.current, defaultValues);

    const didSync = justActivated || entityChanged || defaultsArrivedClean;
    if (didSync) {
      let mergedValues: Record<string, unknown> = {
        ...baseDefaultsRef.current,
      };
      if (isPlainRecord(entity)) {
        mergedValues = mergeDefinedValues(mergedValues, entity);
      }
      if (isPlainRecord(defaultValues)) {
        mergedValues = mergeDefinedValues(mergedValues, defaultValues);
      }

      if (Object.keys(mergedValues).length > 0) {
        form.reset(mergedValues);
      } else {
        form.reset();
      }
    }

    prevOpenRef.current = open;
    if (didSync || isClean) {
      prevEntityRef.current = entity;
      prevEntityIdRef.current = currentEntityId;
      prevDefaultsRef.current = defaultValues;
    }
  }, [open, entity, form, defaultValues]);

  return { isFormDirty };
}
