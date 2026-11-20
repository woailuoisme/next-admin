"use client";

import { Bell, CheckCheck, Search, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";

import {
  formatRelativeTime,
  getCategoryIconComponent,
  SEVERITY_BADGE_CLASSES,
} from "@/components/notifications/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useBatchDeleteNotificationsMutation,
  useBatchMarkNotificationsReadMutation,
  useDeleteNotificationMutation,
  useMarkAsReadMutation,
} from "../hooks";
import type { NotificationCategory, NotificationItem } from "../types";

type CategoryFilter = "all" | NotificationCategory;

const CATEGORY_LABEL_KEY_MAP: Record<NotificationCategory, "tab_system" | "tab_order" | "tab_customer"> = {
  system: "tab_system",
  order: "tab_order",
  customer: "tab_customer",
};

function isSafeInternalUrl(url?: string): url is string {
  return Boolean(url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\"));
}

export interface NotificationsInboxTabProps {
  items: NotificationItem[];
  isLoading: boolean;
}

export function NotificationsInboxTab({ items, isLoading }: NotificationsInboxTabProps) {
  const t = useTranslations("notification");
  const tDialog = useTranslations("dialog");
  const locale = useLocale();
  const router = useRouter();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBatchDeleteOpen, setConfirmBatchDeleteOpen] = useState(false);

  const markAsReadMutation = useMarkAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();
  const batchMarkReadMutation = useBatchMarkNotificationsReadMutation();
  const batchDeleteMutation = useBatchDeleteNotificationsMutation();

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (unreadOnly && item.read) return false;
    if (normalizedSearch) {
      const matchesTitle = item.title.toLowerCase().includes(normalizedSearch);
      const matchesDesc = item.description.toLowerCase().includes(normalizedSearch);
      if (!matchesTitle && !matchesDesc) return false;
    }
    return true;
  });

  const visibleIdSet = new Set(filteredItems.map((i) => i.id));
  const activeSelectedIds = selectedIds.filter((id) => visibleIdSet.has(id));
  const allVisibleSelected = filteredItems.length > 0 && activeSelectedIds.length === filteredItems.length;
  const hasSearchOrCategoryFilter = categoryFilter !== "all" || normalizedSearch.length > 0;
  const hasAnyFilter = hasSearchOrCategoryFilter || unreadOnly;

  const categoryTabs: { key: CategoryFilter; label: string; count: number }[] = [
    { key: "all", label: t("tab_all"), count: items.length },
    { key: "system", label: t("tab_system"), count: items.filter((i) => i.category === "system").length },
    { key: "order", label: t("tab_order"), count: items.filter((i) => i.category === "order").length },
    { key: "customer", label: t("tab_customer"), count: items.filter((i) => i.category === "customer").length },
  ];

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredItems.map((item) => item.id) : []);
  };

  const handleToggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
  };

  const handleClearFilters = () => {
    setCategoryFilter("all");
    setUnreadOnly(false);
    setSearchQuery("");
  };

  const handleBatchMarkRead = async () => {
    if (activeSelectedIds.length === 0) return;
    try {
      const count = await batchMarkReadMutation.mutateAsync(activeSelectedIds);
      setSelectedIds([]);
      toast.success(t("batch_mark_read_success", { count }));
    } catch {
      // 错误提示由 mutation onError 统一处理
    }
  };

  const handleBatchDeleteConfirm = async () => {
    if (activeSelectedIds.length === 0) return;
    try {
      const count = await batchDeleteMutation.mutateAsync(activeSelectedIds);
      setSelectedIds([]);
      setConfirmBatchDeleteOpen(false);
      toast.success(t("batch_delete_success", { count }));
    } catch {
      // 错误提示由 mutation onError 统一处理
    }
  };

  const handleItemOpen = (item: NotificationItem) => {
    if (!item.read) {
      markAsReadMutation.mutate(item.id);
    }
    if (isSafeInternalUrl(item.actionUrl)) {
      router.push(item.actionUrl);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Tabs
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v as CategoryFilter);
                setSelectedIds([]);
              }}
            >
              <TabsList>
                {categoryTabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
                    {tab.label}
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-60 flex-1 sm:w-64 sm:flex-initial">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search_placeholder")}
                  className="h-9 pr-8 pl-8 text-sm"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("clear_filters")}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Switch id="notifications-unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
                <Label htmlFor="notifications-unread-only" className="cursor-pointer text-xs font-medium">
                  {t("unread_only_label")}
                </Label>
              </div>

              {hasAnyFilter ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground h-8 cursor-pointer px-2 text-xs"
                >
                  {t("clear_filters")}
                </Button>
              ) : null}
            </div>
          </div>

          <Separator />

          {/* Batch Selection Bar */}
          <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="notifications-select-all"
                checked={allVisibleSelected}
                onCheckedChange={(checked) => handleToggleSelectAll(checked === true)}
                disabled={filteredItems.length === 0}
              />
              <Label htmlFor="notifications-select-all" className="cursor-pointer text-xs font-medium">
                {activeSelectedIds.length > 0
                  ? t("selected_count", { count: activeSelectedIds.length })
                  : t("select_all")}
              </Label>
            </div>

            {activeSelectedIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={batchMarkReadMutation.isPending}
                  onClick={() => void handleBatchMarkRead()}
                  className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
                >
                  <CheckCheck className="size-3.5" />
                  {t("batch_mark_read")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={batchDeleteMutation.isPending}
                  onClick={() => setConfirmBatchDeleteOpen(true)}
                  className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
                >
                  <Trash2 className="size-3.5" />
                  {t("batch_delete")}
                </Button>
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">
                {t("total_records", { count: filteredItems.length })}
              </span>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="border-border flex items-start gap-3 rounded-lg border p-3.5">
                  <Skeleton className="mt-1 size-4 rounded" />
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3.5 w-full max-w-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="border-border/70 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
              <div className="bg-muted mb-3 flex size-11 items-center justify-center rounded-full">
                <Bell className="text-muted-foreground size-5" />
              </div>
              <p className="text-foreground text-sm font-medium">{t("empty_title")}</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                {hasSearchOrCategoryFilter
                  ? t("empty_search_desc")
                  : unreadOnly
                    ? t("empty_unread_desc")
                    : t("empty_category_desc")}
              </p>
              {hasAnyFilter ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4 cursor-pointer"
                >
                  {t("clear_filters")}
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="divide-border border-border divide-y overflow-hidden rounded-lg border">
              {filteredItems.map((item) => {
                const { Icon, className: iconClassName } = getCategoryIconComponent(item.category, item.severity);
                const severityBgClass = SEVERITY_BADGE_CLASSES[item.severity];
                const isSelected = activeSelectedIds.includes(item.id);
                const canNavigate = isSafeInternalUrl(item.actionUrl);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "hover:bg-muted/40 flex items-start gap-3 p-3.5 transition-colors sm:p-4",
                      !item.read && "bg-primary/5",
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleToggleSelectOne(item.id, checked === true)}
                      aria-label={item.title}
                      className="mt-1.5"
                    />

                    <div
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                        severityBgClass,
                      )}
                    >
                      <Icon className={iconClassName} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {!item.read ? (
                            <span className="bg-primary size-2 shrink-0 rounded-full" aria-hidden="true" />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleItemOpen(item)}
                            className={cn(
                              "text-left text-sm font-medium",
                              canNavigate ? "hover:text-primary cursor-pointer hover:underline" : "cursor-default",
                            )}
                          >
                            {item.title}
                          </button>
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                            {t(CATEGORY_LABEL_KEY_MAP[item.category] ?? "tab_system")}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {formatRelativeTime(item.createdAt, (k, v) => t(k as never, v as never), locale)}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>

                      {canNavigate ? (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => handleItemOpen(item)}
                            className="h-auto cursor-pointer p-0 text-xs"
                          >
                            {item.actionLabel ?? t("open_details")}
                          </Button>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {!item.read ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsReadMutation.mutate(item.id)}
                          aria-label={t("mark_as_read")}
                          title={t("mark_as_read")}
                          className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
                        >
                          <CheckCheck className="size-4" />
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(item.id)}
                        aria-label={t("delete")}
                        title={t("delete")}
                        className="text-muted-foreground hover:text-destructive size-8 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmBatchDeleteOpen} onOpenChange={setConfirmBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("batch_delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("batch_delete_confirm_desc", { count: activeSelectedIds.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDialog("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={batchDeleteMutation.isPending}
              onClick={() => void handleBatchDeleteConfirm()}
            >
              {t("batch_delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
