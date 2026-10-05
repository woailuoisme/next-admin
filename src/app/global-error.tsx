"use client";

import { RootErrorComponent } from "@/components/layout/root-error-component";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh">
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center font-sans antialiased">
        <RootErrorComponent error={error} reset={reset} />
      </body>
    </html>
  );
}
