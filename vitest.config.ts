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
    // vmThreads/vmForks 不可用（MSW 依赖 BroadcastChannel），isolate 不可关（用例间有状态依赖）
    pool: "threads",
    reporters: process.env.CI ? ["dot"] : ["default"],
    server: {
      deps: {
        inline: ["@platejs/math"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/mocks/**", "src/env.ts", "src/types/**", "test/**", "**/*.config.*"],
    },
  },
});
