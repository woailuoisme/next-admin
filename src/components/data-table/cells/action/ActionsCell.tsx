import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import { cn } from "cn";

import type { ActionItem, ActionsCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";
import { DropdownActionsMenu } from "./DropdownActionsMenu";
import { QuickActionButton } from "./QuickActionButton";

const EMPTY_QUICK_ACTIONS: ActionItem<any>[] = [];
const EMPTY_DROPDOWN_ACTIONS: ActionItem<any>[] = [];

/** CRUD 预设操作 id → i18n 文案键（缺省 label 时自动补齐） */
const CRUD_LABEL_KEYS = {
  "crud-view": "actions_view",
  "crud-edit": "actions_edit",
  "crud-delete": "actions_delete",
} as const;

type CrudActionId = keyof typeof CRUD_LABEL_KEYS;

function ActionsCellInner<TData = unknown>({
  row,
  quickActions = EMPTY_QUICK_ACTIONS,
  dropdownActions = EMPTY_DROPDOWN_ACTIONS,
  maxQuickActions = 2,
  align = "center",
  moreActionsLabel,
  className,
}: ActionsCellProps<TData>) {
  const t = useTranslations("table");

  const resolvedMoreActionsLabel = moreActionsLabel ?? t("actions_more");

  const { inlineActions, overflowActions } = useMemo(() => {
    const resolveActionItem = (a: ActionItem<TData>): ActionItem<TData> => {
      // 全序回落：显式 label → CRUD 预设 → ariaLabel → 通用占位，保证渲染结果永不空白
      const presetKey = a.id && a.id in CRUD_LABEL_KEYS ? CRUD_LABEL_KEYS[a.id as CrudActionId] : undefined;
      const resolvedLabel = a.label ?? (presetKey ? t(presetKey) : undefined) ?? a.ariaLabel ?? t("actions_generic");
      const labelString = typeof resolvedLabel === "string" ? resolvedLabel : undefined;
      return {
        ...a,
        label: resolvedLabel,
        ariaLabel: a.ariaLabel ?? labelString,
        tooltip: a.tooltip ?? resolvedLabel,
      };
    };

    const visibleQuick = quickActions
      .filter((a) => (typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden))
      .map(resolveActionItem);
    const visibleDropdown = dropdownActions
      .filter((a) => (typeof a.hidden === "function" ? !a.hidden(row) : !a.hidden))
      .map(resolveActionItem);

    return {
      inlineActions: visibleQuick.slice(0, maxQuickActions),
      overflowActions: [...visibleQuick.slice(maxQuickActions), ...visibleDropdown],
    };
  }, [quickActions, dropdownActions, maxQuickActions, row, t]);

  const handleStopPropagation = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
  });

  return (
    <div
      className={cn("flex items-center gap-1", JUSTIFY_ALIGN_CLASSES[align], className)}
      onClick={handleStopPropagation}
    >
      {inlineActions.map((action, index) => (
        <QuickActionButton
          key={action.id || (typeof action.label === "string" ? action.label : `quick-${index}`)}
          action={action}
          row={row}
          index={index}
          fallbackLabel={t("actions_generic")}
        />
      ))}

      <DropdownActionsMenu actions={overflowActions} row={row} moreActionsLabel={resolvedMoreActionsLabel} />
    </div>
  );
}

export const ActionsCell = memo(ActionsCellInner) as typeof ActionsCellInner;
