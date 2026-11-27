"use client";

import { useDebounceFn } from "ahooks";
import { useEffect, useState } from "react";

export interface UseDebouncedFieldValueOptions<T> {
  value: T;
  debounceMs?: number;
  onChange: (value: T) => void;
  onBlur?: () => void;
}

interface DraftState<T> {
  base: T;
  committed?: T;
  hasCommitted?: boolean;
  current: T;
}

/**
 * Manages local typing draft during debounce without render-phase setState or effect syncing.
 * Automatically discards the draft when an external update (e.g., form reset) diverges from
 * both the starting base and our own last committed value.
 */
export function useDebouncedFieldValue<T>({
  value,
  debounceMs = 0,
  onChange,
  onBlur,
}: UseDebouncedFieldValueOptions<T>) {
  const isDebounced = debounceMs > 0;
  const [draft, setDraft] = useState<DraftState<T> | null>(null);

  const debouncedCommit = useDebounceFn(
    (nextVal: T) => {
      setDraft((prev) => {
        if (!prev || Object.is(prev.current, nextVal)) {
          return null;
        }
        return {
          ...prev,
          base: nextVal,
          hasCommitted: true,
          committed: nextVal,
        };
      });
      onChange(nextVal);
    },
    { wait: Math.max(debounceMs, 0) },
  );

  // If debounceMs switches to <= 0 dynamically, cancel any previously scheduled timer.
  useEffect(() => {
    if (!isDebounced) {
      debouncedCommit.cancel();
    }
  }, [isDebounced, debouncedCommit]);

  const isActiveDraft =
    isDebounced &&
    draft !== null &&
    (draft.hasCommitted ? Object.is(draft.committed, value) : Object.is(draft.base, value));

  const displayValue = isActiveDraft ? draft.current : value;

  const handleChange = (nextVal: T) => {
    if (!isDebounced) {
      onChange(nextVal);
      return;
    }
    setDraft((prev) => {
      const sameDraft =
        prev !== null && (prev.hasCommitted ? Object.is(prev.committed, value) : Object.is(prev.base, value));
      return {
        base: sameDraft ? prev.base : value,
        committed: sameDraft ? prev.committed : undefined,
        hasCommitted: sameDraft ? prev.hasCommitted : false,
        current: nextVal,
      };
    });
    debouncedCommit.run(nextVal);
  };

  const handleClear = (emptyVal: T) => {
    if (isDebounced) {
      debouncedCommit.cancel();
      setDraft(null);
    }
    onChange(emptyVal);
  };

  const flush = () => {
    if (isDebounced) {
      debouncedCommit.flush();
    }
  };

  const handleBlur = () => {
    flush();
    onBlur?.();
  };

  return {
    displayValue,
    handleChange,
    handleClear,
    handleBlur,
    flush,
  };
}
