/**
 * 忘记密码流程的会话内状态。
 *
 * 票据不放进 URL，避免出现在 referrer 与浏览器历史里；
 * 刷新时通过 sessionStorage 恢复，关闭标签页即失效。
 */
const STORAGE_KEY = "auth:reset-flow";

export interface ResetFlowState {
  ticket: string;
  email: string;
  /** 票据过期时间戳（毫秒） */
  expiresAt: number;
  resetToken?: string;
  /** 重置令牌过期时间戳（毫秒） */
  resetExpiresAt?: number;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function saveResetFlow(state: ResetFlowState): void {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function readResetFlow(): ResetFlowState | null {
  if (!isBrowser()) return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let parsed: ResetFlowState;
  try {
    parsed = JSON.parse(raw) as ResetFlowState;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }

  if (!parsed?.ticket || !parsed.email || typeof parsed.expiresAt !== "number") {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }

  if (Date.now() > parsed.expiresAt) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return parsed;
}

/** 在已有票据上补充字段（例如校验通过后写入 resetToken） */
export function patchResetFlow(patch: Partial<ResetFlowState>): ResetFlowState | null {
  const current = readResetFlow();
  if (!current) return null;

  const next = { ...current, ...patch };
  saveResetFlow(next);
  return next;
}

/** 存储里是否还有记录（不做过期判断，用于区分「从未开始」与「已过期」） */
export function hasStoredResetFlow(): boolean {
  return isBrowser() && window.sessionStorage.getItem(STORAGE_KEY) !== null;
}

export function clearResetFlow(): void {
  if (!isBrowser()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

/** 是否已拿到可用于设置新密码的令牌（且未过期） */
export function hasUsableResetToken(state: ResetFlowState | null): state is ResetFlowState & { resetToken: string } {
  if (!state?.resetToken) return false;
  return typeof state.resetExpiresAt === "number" ? Date.now() <= state.resetExpiresAt : true;
}
