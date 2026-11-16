"use client";

import { useKeyPress, useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface UseGlobalSearchOptions {
  onPrefetch?: () => void;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { onPrefetch } = options;
  const [open, setOpen] = useState(false);

  const handleOpen = useMemoizedFn(() => {
    onPrefetch?.();
    setOpen(true);
  });

  const toggle = useMemoizedFn(() => {
    onPrefetch?.();
    setOpen((prev) => !prev);
  });

  useKeyPress(
    ["meta.k", "ctrl.k", "/"],
    (event) => {
      const target = event.target as HTMLElement | null;
      const isCommandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      // Allow Cmd/Ctrl+K even inside editable targets (such as CommandInput when closing),
      // while guarding "/" against other modifier combinations and editable/interactive surfaces.
      if (!isCommandShortcut) {
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        if (target) {
          const isEditableTarget =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable;
          if (isEditableTarget) {
            return;
          }
          if (target.closest('[role="combobox"], [role="listbox"], [role="dialog"], [role="menu"]')) {
            return;
          }
        }
      }
      event.preventDefault();
      toggle();
    },
    {
      exactMatch: false,
    },
  );

  return {
    open,
    handleOpen,
    setOpen,
  };
}
