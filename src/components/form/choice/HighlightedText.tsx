"use client";

import { memo, useMemo } from "react";

import { cn } from "cn";

import { splitHighlightSegments } from "./treeEngine";

interface HighlightedTextProps {
  text: string;
  keyword: string;
  variant?: "mark" | "inline";
}

export const HighlightedText = memo(function HighlightedText({
  text,
  keyword,
  variant = "inline",
}: HighlightedTextProps) {
  const segments = useMemo(() => splitHighlightSegments(text, keyword), [text, keyword]);
  return (
    <>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark
            key={index}
            className={cn(
              variant === "mark"
                ? "bg-primary/20 text-primary rounded-xs px-0.5 font-medium"
                : "bg-transparent text-primary font-semibold",
            )}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
});
