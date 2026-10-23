import { z } from "zod";

const mockFlag = process.env.NEXT_PUBLIC_ENABLE_MOCK;

/** 未显式配置时按运行环境推导，显式配置优先 */
const defaultEnableMock =
  mockFlag === undefined ? process.env.NODE_ENV === "development" : mockFlag === "true" || mockFlag === "1";

const envSchema = z.object({
  APP_TITLE: z.string().min(1).default("Next SN Admin"),
  APP_URL: z.string().url().or(z.literal("")).default(""),
  ENABLE_MOCK: z.boolean().default(defaultEnableMock),
  API_URL: z.string().url().or(z.literal("")).default(""),
  AMAP_KEY: z.string().default(""),
  TIANDITU_TOKEN: z.string().default(""),
});

const parsed = envSchema.safeParse({
  APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  ENABLE_MOCK: defaultEnableMock,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY,
  TIANDITU_TOKEN: process.env.NEXT_PUBLIC_TIANDITU_TOKEN,
});

if (!parsed.success) {
  throw new Error(`环境变量配置无效：\n${z.prettifyError(parsed.error)}`);
}

/**
 * Next.js 统一环境变量配置
 * - 提供优雅简短命名：如 env.API_URL, env.AMAP_KEY, env.ENABLE_MOCK
 */
export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
