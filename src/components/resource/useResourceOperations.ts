import { useMemoizedFn } from "ahooks";
import { useRouter } from "next/navigation";

import {
  type ResourceModalState,
  type UseResourceModalStateOptions,
  useResourceModalState,
} from "@/components/dialogs/hooks/useResourceModalState";

import type { ResourceOperationsConfig, ResourcePresentation } from "./types";

export interface UseResourceOperationsOptions<TData = unknown, TSearch = unknown>
  extends UseResourceModalStateOptions<TData, TSearch>, ResourceOperationsConfig {
  /**
   * Custom navigation handler (override).
   */
  navigate?: (target: string) => void;
  /**
   * Custom page path generators for page mode.
   */
  pagePaths?: {
    create?: (basePath: string) => string;
    edit?: (basePath: string, id: string) => string;
    view?: (basePath: string, id: string) => string;
  };
}

export interface ResourceOperations<TData = unknown> extends ResourceModalState<TData> {
  /** Resolved presentation mode for Create */
  createPresentation: ResourcePresentation;
  /** Resolved presentation mode for Edit */
  editPresentation: ResourcePresentation;
  /** Resolved presentation mode for View */
  viewPresentation: ResourcePresentation;
  /** Base route path */
  basePath?: string;
}

/**
 * useResourceOperations:
 * Filament v5 风格企业级 CRUD 状态与操作调度器 Hook。
 *
 * 核心设计优势：
 * 1. 统一调度 Dialog / Drawer / Page 三种形态下的创建、编辑、详情查看与删除流程；
 * 2. 当形态为 "dialog" 或 "drawer" 时，通过 useResourceModalState 自动同步 URL Search Params（如 ?create=true, ?editId=xxx）；
 * 3. 当形态为 "page" 时，无缝跳转至独立路由页面（如 /orders/create, /orders/123/edit, /orders/123）；
 * 4. 严格遵循 AGENTS.md 规范，路由句柄与状态完全解耦，支持免 Mock 在单元测试与 Storybook 中独立运行。
 */
function resolvePresentation(
  presentation: UseResourceOperationsOptions["presentation"],
  key: "create" | "edit" | "view",
): ResourcePresentation {
  if (typeof presentation === "string") return presentation;
  return presentation?.[key] ?? "dialog";
}

export function useResourceOperations<TData = unknown, TSearch = unknown>(
  options: UseResourceOperationsOptions<TData, TSearch> = {},
): ResourceOperations<TData> {
  const {
    basePath,
    presentation = "dialog",
    syncWithUrl,
    search,
    keys,
    pagePaths,
    navigate: customNavigate,
    onCreate,
    onEdit,
    onView,
    onDelete,
    onBatchDelete,
  } = options;

  const router = useRouter();

  const createPresentation = resolvePresentation(presentation, "create");
  const editPresentation = resolvePresentation(presentation, "edit");
  const viewPresentation = resolvePresentation(presentation, "view");

  // Initialize underlying modal state for Dialog/Drawer and Delete workflows
  const modalState = useResourceModalState<TData, TSearch>({
    syncWithUrl,
    search,
    keys,
    onCreate,
    onEdit,
    onView,
    onDelete,
    onBatchDelete,
  });

  const executeNavigation = useMemoizedFn((targetPath: string) => {
    if (customNavigate) {
      customNavigate(targetPath);
      return;
    }
    router.push(targetPath);
  });

  const openCreate = useMemoizedFn(() => {
    onCreate?.();
    if (createPresentation === "page") {
      const target = pagePaths?.create
        ? pagePaths.create(basePath ?? "")
        : basePath
          ? `${basePath}/create`
          : null;
      if (target) {
        executeNavigation(target);
      }
    } else {
      modalState.openCreate();
    }
  });

  const openEdit = useMemoizedFn((id: string) => {
    onEdit?.(id);
    if (editPresentation === "page") {
      const target = pagePaths?.edit
        ? pagePaths.edit(basePath ?? "", id)
        : basePath
          ? `${basePath}/${id}/edit`
          : null;
      if (target) {
        executeNavigation(target);
      }
    } else {
      modalState.openEdit(id);
    }
  });

  const openView = useMemoizedFn((id: string) => {
    onView?.(id);
    if (viewPresentation === "page") {
      const target = pagePaths?.view
        ? pagePaths.view(basePath ?? "", id)
        : basePath
          ? `${basePath}/${id}`
          : null;
      if (target) {
        executeNavigation(target);
      }
    } else {
      modalState.openView(id);
    }
  });

  return {
    ...modalState,
    createPresentation,
    editPresentation,
    viewPresentation,
    basePath,
    openCreate,
    openEdit,
    openView,
  };
}
