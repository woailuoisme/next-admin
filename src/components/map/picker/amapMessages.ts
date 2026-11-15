const AMAP_INFO_MESSAGES: Record<string, string> = {
  MISSING_AMAP_KEY: "服务端未配置 AMAP_KEY，地理编码服务暂未启用",
  INVALID_USER_KEY: "高德 key 无效，请检查服务端 AMAP_KEY 配置是否正确",
  USERKEY_PLAT_NOMATCH: "高德 key 平台类型不匹配：需在高德控制台创建「Web服务」类型的 key",
  SERVICE_NOT_AVAILABLE: "高德服务暂不可用，请稍后重试",
  DAILY_QUERY_OVER_LIMIT: "高德接口今日配额已用尽",
  INVALID_PARAMS: "高德接口参数有误",
  NETWORK_ERROR: "地理编码网络请求失败，请检查网络连接",
};

export const AMAP_RATE_LIMIT_REASON = "高德接口请求频次过高（HTTP 429），已自动进入 60s 冷却保护";
export const AMAP_COOLDOWN_REASON = "高德接口冷却保护中，请稍后重试";

export function formatHttpErrorReason(httpStatus: number): string {
  return `地理编码请求失败（HTTP ${httpStatus}）`;
}

export function describeAmapInfo(info: string): string {
  return AMAP_INFO_MESSAGES[info] ?? `高德接口返回错误：${info}`;
}
