import { memo } from "react";

import { ViewDialog } from "@/components/dialogs";

import type { ResourceViewHostProps } from "./types";

import { ResourceViewPage } from "./ResourceViewPage";

/**
 * ResourceViewHost:
 * Filament v5 风格企业级详情视图宿主容器。
 * 支持根据 presentation 属性在三种工业级形态间无缝切换：
 * - "dialog": 居中模态弹窗 (Modal)
 * - "drawer": 右侧滑出抽屉 (SlideOver / Sheet)
 * - "page": 独立路由全屏页面 (Page)
 *
 * 视图内容与详情展示结构 100% 复用，统一标题、面包屑、状态徽章与编辑/返回操作。
 */
export const ResourceViewHost = memo(function ResourceViewHost({
  presentation = "dialog",
  open = false,
  onOpenChange = () => {},
  title,
  description,
  badge,
  size = "md",
  widthClassName,
  className,
  footerClassName,
  breadcrumbs,
  backTo,
  backLabel,
  onEdit,
  editText = "Edit",
  closeText = "Close",
  loading = false,
  extraActions,
  children,
}: ResourceViewHostProps) {
  if (presentation === "page") {
    return (
      <ResourceViewPage
        title={title}
        description={description}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backTo={backTo}
        backLabel={backLabel}
        onEdit={onEdit}
        editText={editText}
        closeText={closeText}
        loading={loading}
        extraActions={extraActions}
        className={className}
        footerClassName={footerClassName}
      >
        {children}
      </ResourceViewPage>
    );
  }

  return (
    <ViewDialog
      open={open}
      onOpenChange={onOpenChange}
      variant={presentation === "drawer" ? "sheet" : "dialog"}
      title={title}
      description={description}
      badge={badge}
      size={size}
      widthClassName={widthClassName}
      loading={loading}
      onEdit={onEdit}
      editText={editText}
      closeText={closeText}
      extraActions={extraActions}
      className={className}
      footerClassName={footerClassName}
    >
      {children}
    </ViewDialog>
  );
});
