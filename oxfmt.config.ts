import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 120,
  sortTailwindcss: true,
  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "src/components/ui/**",
    "public/**",
    ".agents/**",
  ],
});
