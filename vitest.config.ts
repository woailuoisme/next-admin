import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      test: path.resolve(import.meta.dirname, "./test"),
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/mocks/**", "src/env.ts", "src/types/**"],
      // 在增量补齐测试用例后可开启全局阻断门槛：
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 65,
      //   statements: 70,
      // },
    },
  },
});
