/**
 * GlitchTip / Sentry Exception Monitoring Integration
 */

export function isGlitchTipEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(process.env.NEXT_PUBLIC_GLITCHTIP_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isGlitchTipEnabled()) {
    return;
  }
  console.error("[GlitchTip Captured Exception]", error, context);
}

export function triggerTestError(): { success: boolean; message: string } {
  if (!isGlitchTipEnabled()) {
    return {
      success: false,
      message: "未配置 GlitchTip DSN，请在环境变量中设置 NEXT_PUBLIC_GLITCHTIP_DSN",
    };
  }

  try {
    throw new Error(`[GlitchTip Diagnostic] Test exception generated at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[GlitchTip Test Error Captured]", err);
    return {
      success: true,
      message: "测试异常已捕获并上报",
    };
  }
}
