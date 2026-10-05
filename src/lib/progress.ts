import NProgress from "nprogress";

if (typeof window !== "undefined") {
  NProgress.configure({
    showSpinner: false,
    speed: 250,
    trickleSpeed: 200,
    minimum: 0.08,
  });
}

const DEBOUNCE_DELAY = 100;

let activeCount = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let navigationPending = false;

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

export const progress = {
  /**
   * 启动或递增一个正在进行的异步任务。
   * 采用 100ms 防抖防闪烁机制：
   * 100ms 内完成的请求直接取消展示；超过 100ms 则平滑渐显。
   */
  start() {
    if (typeof window === "undefined") return;
    activeCount += 1;
    if (activeCount === 1) {
      clearTimer();
      timer = setTimeout(() => {
        NProgress.start();
        timer = null;
      }, DEBOUNCE_DELAY);
    }
  },

  /**
   * 完成并递减一个异步任务。
   * 当所有并发任务全部归零时平滑结束。
   */
  done() {
    if (typeof window === "undefined") return;
    if (activeCount === 0) {
      return;
    }

    activeCount -= 1;

    if (activeCount === 0) {
      if (timer !== null) {
        // 任务在 100ms 防抖窗口期内极速完成，静默清除定时器，杜绝界面闪烁
        clearTimer();
      } else {
        // 任务已触发进度条显示，平滑完成并淡出
        NProgress.done();
      }
    }
  },

  /**
   * 开始一次导航级任务。
   * 若上一次导航未正常收尾（Next.js 对 redirect / 加载报错等 control outcome
   * 不会正常结算），先结算上一次，避免引用计数永久泄漏导致进度条卡死。
   */
  beginNavigation() {
    if (navigationPending) {
      navigationPending = false;
      progress.done();
    }
    navigationPending = true;
    progress.start();
  },

  /**
   * 结束一次导航级任务；无对应 beginNavigation 时为空操作。
   */
  endNavigation() {
    if (!navigationPending) return;
    navigationPending = false;
    progress.done();
  },

  /**
   * 强行重置计数器并终结进度条（常用于未授权跳出、全局未捕获异常恢复等兜底场景）。
   */
  reset() {
    clearTimer();
    navigationPending = false;
    activeCount = 0;
    if (typeof window !== "undefined") {
      NProgress.done(true);
    }
  },

  /**
   * 获取当前活跃任务引用计数（供测试与系统状态观测使用）。
   */
  getActiveCount() {
    return activeCount;
  },

  /**
   * 当前是否存在正在等待或运行的异步任务。
   */
  isPending() {
    return activeCount > 0;
  },
};
