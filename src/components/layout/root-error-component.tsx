import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronDown, Home, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { captureException } from "@/integrations/glitchtip";
import { progress } from "@/lib/progress";

export interface ErrorComponentProps {
  error: Error & { digest?: string };
  reset: () => void;
  info?: { componentStack?: string };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "An unexpected error occurred.";
}

export function RootErrorComponent({ error, reset, info }: ErrorComponentProps) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    progress.reset();
    captureException(error, {
      tags: {
        source: "root_error_component",
      },
      extra: {
        componentStack: info?.componentStack,
      },
    });
  }, [error, info?.componentStack]);

  const handleRetry = () => {
    reset();
    router.refresh();
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center"
    >
      <div className="bg-destructive/10 text-destructive mb-4 flex size-14 items-center justify-center rounded-full shadow-xs">
        <AlertCircle aria-hidden="true" className="size-7" />
      </div>
      <h2 className="mb-2 text-xl font-bold tracking-tight">页面加载遇到异常 (Page Load Error)</h2>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">{errorMessage}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={handleRetry} className="cursor-pointer gap-2">
          <RefreshCw aria-hidden="true" className="size-4" />
          重试 (Retry)
        </Button>
        <Button variant="outline" asChild className="cursor-pointer gap-2">
          <Link href="/">
            <Home aria-hidden="true" className="size-4" />
            返回控制台 (Dashboard)
          </Link>
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" &&
        (error instanceof Error || info?.componentStack) && (
          <div className="mt-8 w-full max-w-2xl text-left">
            <button
              type="button"
              aria-expanded={showDetails}
              aria-controls="error-stack-trace"
              onClick={() => setShowDetails(!showDetails)}
              className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors"
            >
              <ChevronDown
                aria-hidden="true"
                className={`size-3.5 transition-transform duration-200 ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
              {showDetails ? "隐藏技术详情" : "查看技术详情 (Stack Trace)"}
            </button>
            {showDetails && (
              <pre
                id="error-stack-trace"
                className="border-destructive/20 bg-muted/50 text-destructive/90 mt-2 max-h-60 overflow-auto rounded-md border p-4 font-mono text-xs whitespace-pre-wrap"
              >
                {error instanceof Error ? error.stack : String(error)}
                {info?.componentStack && `\n\nComponent Stack:${info.componentStack}`}
              </pre>
            )}
          </div>
        )}
    </div>
  );
}
