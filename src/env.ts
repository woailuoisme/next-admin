/**
 * Next.js Environment Configuration with fallback compatibility
 */
export const env = {
  NEXT_PUBLIC_ENABLE_MOCK:
    process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK === "1" ||
    process.env.NODE_ENV === "development",
  VITE_ENABLE_MOCK:
    process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK === "1" ||
    process.env.NODE_ENV === "development",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
  VITE_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "",
  VITE_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_API_BASE_URL ||
    process.env.VITE_API_URL ||
    "",
  NEXT_PUBLIC_AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY || "",
  VITE_AMAP_KEY: process.env.NEXT_PUBLIC_AMAP_KEY || process.env.VITE_AMAP_KEY || "",
  NEXT_PUBLIC_TIANDITU_TOKEN: process.env.NEXT_PUBLIC_TIANDITU_TOKEN || "",
  VITE_TIANDITU_TOKEN:
    process.env.NEXT_PUBLIC_TIANDITU_TOKEN || process.env.VITE_TIANDITU_TOKEN || "",
};
