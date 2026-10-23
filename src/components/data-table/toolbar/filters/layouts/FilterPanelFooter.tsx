import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/ui/button";

export interface FilterPanelFooterProps {
  deferFilters?: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FilterPanelFooter: React.FC<FilterPanelFooterProps> = ({ deferFilters = false, onClose, onApply }) => {
  const t = useTranslations("table");

  return (
    <div className="flex items-center justify-end gap-2 border-t pt-3">
      <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
        {t("filter_close")}
      </Button>
      <Button type="button" size="sm" onClick={onApply} className="h-8 px-4 text-xs font-medium">
        {deferFilters ? t("filter_apply") : t("filter_done")}
      </Button>
    </div>
  );
};
