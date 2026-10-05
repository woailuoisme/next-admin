import { useBoolean, useKeyPress } from "ahooks";

export function useGlobalSearch() {
  const [open, { setTrue, setFalse, set, toggle }] = useBoolean(false);

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
    handleOpen: setTrue,
    handleClose: setFalse,
    setOpen: set,
  };
}
