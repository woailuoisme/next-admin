import { Suspense, lazy, memo, useCallback } from "react";

import type { GlobalSearchProps } from "./types";

import { GlobalSearchTrigger } from "./GlobalSearchTrigger";
import { useGlobalSearch } from "./useGlobalSearch";

// Prefetch function to load the dialog bundle in idle time or hover
let prefetchPromise: Promise<unknown> | null = null;
const prefetchDialog = () => {
  if (!prefetchPromise) {
    prefetchPromise = import("./GlobalSearchDialog");
  }
  return prefetchPromise;
};

const GlobalSearchDialog = lazy(() =>
  import("./GlobalSearchDialog").then((mod) => ({
    default: mod.GlobalSearchDialog,
  })),
);

export const GlobalSearch = memo(function GlobalSearch({ className }: GlobalSearchProps) {
  const { open, handleOpen, setOpen } = useGlobalSearch();

  const handleMouseEnter = useCallback(() => {
    prefetchDialog();
  }, []);

  return (
    <>
      <GlobalSearchTrigger
        onClick={handleOpen}
        onMouseEnter={handleMouseEnter}
        className={className}
      />
      {open ? (
        <Suspense fallback={null}>
          <GlobalSearchDialog open={open} onOpenChange={setOpen} />
        </Suspense>
      ) : null}
    </>
  );
});
