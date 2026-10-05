const ENABLE_MOCK =
  process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_MOCK === "1" ||
  process.env.NODE_ENV === "development";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY || "";
const TIANDITU_TOKEN = process.env.NEXT_PUBLIC_TIANDITU_TOKEN || "";
const APP_TITLE = process.env.NEXT_PUBLIC_APP_TITLE || "Next SN Admin";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

/**
 * Next.js 统一环境变量配置
 * - 提供优雅简短命名（推荐）：如 env.API_URL, env.AMAP_KEY, env.ENABLE_MOCK
 * - 同时兼容完整命名：如 env.NEXT_PUBLIC_API_URL
 */
export const env = {
  // 简明业务别名（推荐在应用代码中直接使用）
  APP_TITLE,
  APP_URL,
  ENABLE_MOCK,
  API_URL,
  AMAP_KEY,
  TIANDITU_TOKEN,

  // 规范命名兼容
  NEXT_PUBLIC_APP_TITLE: APP_TITLE,
  NEXT_PUBLIC_APP_URL: APP_URL,
  NEXT_PUBLIC_ENABLE_MOCK: ENABLE_MOCK,
  NEXT_PUBLIC_API_URL: API_URL,
  NEXT_PUBLIC_AMAP_KEY: AMAP_KEY,
  NEXT_PUBLIC_TIANDITU_TOKEN: TIANDITU_TOKEN,
};
