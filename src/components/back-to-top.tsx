"use client";

import { useEventListener, useMemoizedFn } from "ahooks";
import { clamp } from "es-toolkit";
import { ArrowUp } from "lucide-react";
import { type CSSProperties, type MouseEvent, type ReactNode, memo, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "cn";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface BackToTopProps {
  /**
   * 触发显示滚动的距离阈值（单位：px）
   * @default 300
   */
  threshold?: number;

  /**
   * 滚动监听与回滚目标获取函数
   * @default () => window
   */
  target?: () => HTMLElement | Window | Document | null;

  /**
   * 是否显示 SVG 环形滚动进度条
   * @default true
   */
  showProgress?: boolean;

  /**
   * 是否启用平滑滚动动画
   * @default true
   */
  smooth?: boolean;

  /**
   * 返回顶部时的目标顶部偏移（单位：px）
   * @default 0
   */
  top?: number;

  /**
   * Tooltip 浮层提示内容，设为 null 或 false 可禁用 Tooltip
   * @default t("back_to_top")
   */
  tooltip?: ReactNode | false | null;

  /**
   * 自定义内部内容插槽（默认展示向上箭头图标）
   */
  children?: ReactNode;

  /**
   * 环形进度条描边粗细
   * @default 2.5
   */
  strokeWidth?: number;

  /**
   * 自定义类名（支持覆盖默认定位与样式）
   */
  className?: string;

  /**
   * 自定义行内样式
   */
  style?: CSSProperties;

  /**
   * 点击按钮的回调事件
   */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;

  /**
   * 无障碍描述
   */
  "aria-label"?: string;
}

// SVG 圆环常量 (viewBox 0 0 36 36, 半径 15.5)
const SVG_RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * SVG_RADIUS;

function resolveTargetEl(
  target?: () => HTMLElement | Window | Document | null,
): HTMLElement | Window | Document | null {
  if (typeof window === "undefined") return null;
  return target?.() ?? window;
}

function getScrollMetrics(targetEl: HTMLElement | Window | Document | null) {
  if (!targetEl) {
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
  }

  if (
    targetEl === window ||
    targetEl === document ||
    (typeof document !== "undefined" && targetEl === document.documentElement)
  ) {
    const doc = document.documentElement;
    const body = document.body;
    return {
      scrollTop: window.scrollY || doc?.scrollTop || body?.scrollTop || 0,
      scrollHeight: Math.max(
        doc?.scrollHeight || 0,
        body?.scrollHeight || 0,
        doc?.offsetHeight || 0,
        body?.offsetHeight || 0,
      ),
      clientHeight: window.innerHeight || doc?.clientHeight || 0,
    };
  }

  const el = targetEl as HTMLElement;
  return {
    scrollTop: el.scrollTop || 0,
    scrollHeight: el.scrollHeight || 0,
    clientHeight: el.clientHeight || 0,
  };
}

function scrollToTop(targetEl: HTMLElement | Window | Document | null, top: number, smooth: boolean) {
  if (!targetEl) return;
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";

  if (
    targetEl === window ||
    targetEl === document ||
    (typeof document !== "undefined" && targetEl === document.documentElement)
  ) {
    if (typeof window.scrollTo === "function") {
      window.scrollTo({ top, behavior });
    } else {
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
    }
  } else {
    const el = targetEl as HTMLElement;
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ top, behavior });
    } else {
      el.scrollTop = top;
    }
  }
}

export const BackToTop = memo(function BackToTop({
  threshold = 300,
  target,
  showProgress = true,
  smooth = true,
  top = 0,
  tooltip,
  children,
  strokeWidth = 2.5,
  className,
  style,
  onClick,
  "aria-label": ariaLabel,
}: BackToTopProps) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateScroll = useMemoizedFn(() => {
    const targetEl = resolveTargetEl(target);
    const { scrollTop, scrollHeight, clientHeight } = getScrollMetrics(targetEl);

    setVisible(scrollTop >= threshold);

    const scrollableDistance = Math.max(0, scrollHeight - clientHeight);
    setProgress(scrollableDistance > 0 ? clamp((scrollTop / scrollableDistance) * 100, 0, 100) : 0);
  });

  useEventListener("scroll", updateScroll, { target, passive: true });
  useEventListener("resize", updateScroll, { passive: true });

  useEffect(() => {
    updateScroll();
  }, [updateScroll]);

  const handleClick = useMemoizedFn((e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    scrollToTop(resolveTargetEl(target), top, smooth);
  });

  if (!visible) {
    return null;
  }

  const resolvedTooltip = tooltip === undefined ? t("back_to_top") : tooltip;
  const buttonAriaLabel =
    ariaLabel || (typeof resolvedTooltip === "string" ? resolvedTooltip : t("back_to_top"));

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      aria-label={buttonAriaLabel}
      style={style}
      className={cn(
        "group fixed right-5 bottom-5 z-50 md:right-8 md:bottom-8",
        "flex size-9 items-center justify-center md:size-10",
        "cursor-pointer rounded-full select-none",
        "border border-border/60 bg-background/85 text-foreground shadow-md backdrop-blur-md",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:border-primary/50 hover:bg-accent/90 hover:shadow-lg active:scale-95",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        "animate-in duration-200 fade-in-0 zoom-in-90",
        className,
      )}
    >
      {showProgress && (
        <svg
          data-slot="progress-ring"
          data-testid="back-to-top-progress"
          className="pointer-events-none absolute inset-0 size-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          {/* 背景轨道底环 */}
          <circle
            cx="18"
            cy="18"
            r={SVG_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30 dark:text-muted/40"
          />
          {/* 动态进度环 */}
          <circle
            cx="18"
            cy="18"
            r={SVG_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-primary transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
      )}

      {children ?? (
        <ArrowUp
          className="text-foreground/80 group-hover:text-primary relative z-10 size-4 transition-transform duration-200 group-hover:-translate-y-0.5 md:size-4.5"
          aria-hidden="true"
        />
      )}
    </button>
  );

  if (resolvedTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          {resolvedTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonElement;
});
