"use client";

import { Sparkles } from "lucide-react";

import type { ShowcaseFormValues } from "../types";

export interface FormSubmittedCardProps {
  data: ShowcaseFormValues;
}

export function FormSubmittedCard({ data }: FormSubmittedCardProps) {
  return (
    <div className="border-primary/40 bg-card/60 space-y-2 rounded-xl border p-4">
      <div className="text-primary flex items-center gap-1.5 text-xs font-semibold">
        <Sparkles className="size-3.5" />
        <span>Live Form Output JSON</span>
      </div>
      <pre className="bg-muted/70 text-foreground/90 overflow-x-auto rounded-md p-3 font-mono text-[11px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
