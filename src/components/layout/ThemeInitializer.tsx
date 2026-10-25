import { memo, useEffect } from "react";

import { usePreferencesStore } from "@/stores/preferences";

/**
 * Initializes client-side theme DOM bindings once on mount.
 */
export const ThemeInitializer = memo(function ThemeInitializer() {
  useEffect(() => {
    const cleanup = usePreferencesStore.getState().initTheme();
    return cleanup;
  }, []);

  return null;
});
