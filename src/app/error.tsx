"use client";

import { RootErrorComponent } from "@/components/layout/root-error-component";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RootErrorComponent error={error} reset={reset} />;
}
