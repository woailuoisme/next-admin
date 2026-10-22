import { useMemoizedFn } from "ahooks";
import { useState } from "react";

export interface UseDialogFullscreenOptions {
  /** 对话框当前是否打开，关闭时复位内部全屏状态 */
  open: boolean;
  /** 受控全屏状态，省略则由本 Hook 维护 */
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

/**
 * 对话框全屏状态机（受控 / 非受控双模 + 关闭复位），FormDialog 与 ViewDialog 共用
 */
export function useDialogFullscreen({
  open,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
}: UseDialogFullscreenOptions) {
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // 关闭时复位：渲染期调整 state，避免多一次提交与首帧闪烁
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setInternalFullscreen(false);
    }
  }

  const isFullscreen = controlledFullscreen ?? internalFullscreen;

  const toggleFullscreen = useMemoizedFn(() => {
    const next = !isFullscreen;
    if (controlledFullscreen === undefined) {
      setInternalFullscreen(next);
    }
    onFullscreenChange?.(next);
  });

  return { isFullscreen, toggleFullscreen };
}
