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
 * - 提供优雅简短命名：如 env.API_URL, env.AMAP_KEY, env.ENABLE_MOCK
 */
export const env = {
  APP_TITLE,
  APP_URL,
  ENABLE_MOCK,
  API_URL,
  AMAP_KEY,
  TIANDITU_TOKEN,
};
