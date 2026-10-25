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
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
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
