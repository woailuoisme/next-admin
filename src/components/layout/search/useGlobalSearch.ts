import { useKeyPress, useMemoizedFn } from "ahooks";
import { useState } from "react";

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  const handleOpen = useMemoizedFn(() => setOpen(true));
  const handleClose = useMemoizedFn(() => setOpen(false));
  const toggle = useMemoizedFn(() => setOpen((prev) => !prev));

  useKeyPress(
    ["meta.k", "ctrl.k", "/"],
    (event) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
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
    handleClose,
    setOpen,
  };
}
