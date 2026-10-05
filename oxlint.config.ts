import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "unicorn", "typescript", "oxc", "import", "jsx-a11y", "nextjs"],
  categories: {
    correctness: "warn",
  },
  rules: {
    "jsx-a11y/prefer-tag-over-role": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-autofocus": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "jsx-a11y/no-noninteractive-tabindex": "off",
    "jsx-a11y/role-has-required-aria-props": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "jsx-a11y/interactive-supports-focus": "off",
    "nextjs/no-img-element": "off",
  },
  env: {
    builtin: true,
    browser: true,
    node: true,
  },
  ignorePatterns: [
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
    "src/components/ui/**",
    ".agents/**",
  ],
});
