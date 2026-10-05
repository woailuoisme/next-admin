import { defineConfig } from "oxfmt";

export default defineConfig({
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  arrowParens: "always",
  sortTailwindcss: true,
  sortPackageJson: true,
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
