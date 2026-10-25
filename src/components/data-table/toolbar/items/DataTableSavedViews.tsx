import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Bookmark, Check, Plus, Trash2 } from "lucide-react";
import { type FormEvent, memo, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import type { DataTableSavedView } from "../../core/types";

export interface DataTableSavedViewsProps {
  views: DataTableSavedView[];
  activeViewId?: string | null;
  onApplyView: (viewId: string) => void;
  onSaveCurrentView: (name: string) => void;
  onDeleteView?: (viewId: string) => void;
  className?: string;
}

export const DataTableSavedViews = memo(function DataTableSavedViews({
  views,
  activeViewId,
  onApplyView,
  onSaveCurrentView,
  onDeleteView,
  className,
}: DataTableSavedViewsProps) {
  const t = useTranslations("table");
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newViewName, setNewViewName] = useState("");

  const activeView = useMemo(() => {
    return views.find((v) => v.id === activeViewId);
  }, [views, activeViewId]);

  const handleSave = useMemoizedFn((e: FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim()) return;
    onSaveCurrentView(newViewName.trim());
    setNewViewName("");
    setIsCreating(false);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground",
            activeView && "border-primary/40 bg-primary/5 font-medium text-primary",
            className,
          )}
        >
          <Bookmark className="size-3.5" />
          <span>{activeView ? activeView.name : t("views_title")}</span>
          {views.length > 0 ? (
            <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
              {views.length}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 shadow-lg">
        <div className="space-y-2.5">
          <div className="border-border/60 flex items-center justify-between border-b pb-2">
            <span className="text-foreground text-xs font-semibold">{t("views_saved_title")}</span>
            {!isCreating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 gap-1 px-1.5 text-[11px]"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="size-3" />
                <span>{t("views_save_current")}</span>
              </Button>
            )}
          </div>

          {/* Create new view form */}
          {isCreating && (
            <form onSubmit={handleSave} className="bg-muted/40 space-y-1.5 rounded-md p-2">
              <Input
                type="text"
                autoFocus
                placeholder={t("views_name_placeholder")}
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="h-7 w-full text-xs"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => {
                    setIsCreating(false);
                    setNewViewName("");
                  }}
                >
                  {t("views_cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={!newViewName.trim()} className="h-6 px-2 text-[11px]">
                  {t("views_save")}
                </Button>
              </div>
            </form>
          )}

          {/* Views List */}
          <div className="max-h-56 space-y-1 overflow-y-auto pr-0.5">
            {views.length === 0 ? (
              <div className="text-muted-foreground/60 py-3 text-center text-xs italic">{t("views_empty")}</div>
            ) : (
              views.map((v) => {
                const isActive = v.id === activeViewId;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      onApplyView(v.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "group/view flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                      isActive ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-muted/50",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Bookmark className="size-3.5 shrink-0 opacity-60" />
                      <span className="truncate">{v.name}</span>
                      {v.isSystem ? (
                        <Badge variant="secondary" className="px-1 py-0 text-[9px] uppercase">
                          {t("views_default")}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {isActive ? <Check className="text-primary size-3.5" /> : null}
                      {!v.isSystem && onDeleteView ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteView(v.id);
                          }}
                          className="text-muted-foreground/50 hover:text-destructive size-5 rounded p-0.5 opacity-0 transition-opacity group-hover/view:opacity-100"
                          title="Delete view"
                          aria-label={`Delete ${v.name}`}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});
