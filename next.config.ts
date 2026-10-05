import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "es-toolkit",
      "radix-ui",
      "@shadcn/react",
      "cmdk",
      "embla-carousel-react",
      "sonner",
    ],
  },
};

export default nextConfig;
