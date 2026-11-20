import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "ahooks",
      "recharts",
      "date-fns",
      "es-toolkit",
      "radix-ui",
      "@shadcn/react",
      "cmdk",
      "embla-carousel-react",
      "sonner",
      "@tanstack/react-form",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/modifiers",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "react-day-picker",
      "input-otp",
    ],
  },
};

export default withNextIntl(nextConfig);
