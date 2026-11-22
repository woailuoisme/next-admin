export type ScrollTargetResolver = () => HTMLElement | Window | Document | null;

export function resolveScrollTargetEl(target?: ScrollTargetResolver): HTMLElement | Window | Document | null {
  if (typeof window === "undefined") return null;
  return target?.() ?? window;
}

/** 目标是否为文档级滚动容器（window / document / <html>） */
export function isDocumentScroller(targetEl: HTMLElement | Window | Document): boolean {
  return (
    targetEl === window ||
    targetEl === document ||
    (typeof document !== "undefined" && targetEl === document.documentElement)
  );
}

export function getScrollMetrics(targetEl: HTMLElement | Window | Document | null) {
  if (!targetEl) {
    return { scrollTop: 0, scrollHeight: 0, clientHeight: 0 };
  }

  if (isDocumentScroller(targetEl)) {
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

export function scrollToTopPosition(targetEl: HTMLElement | Window | Document | null, top: number, smooth: boolean) {
  if (!targetEl) return;
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";

  if (isDocumentScroller(targetEl)) {
    if (typeof window.scrollTo === "function") {
      window.scrollTo({ top, behavior });
    } else {
      document.documentElement.scrollTop = top;
      document.body.scrollTop = top;
    }
    return;
  }

  const el = targetEl as HTMLElement;
  if (typeof el.scrollTo === "function") {
    el.scrollTo({ top, behavior });
  } else {
    el.scrollTop = top;
  }
}
