import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { memo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { BreadcrumbItem } from "./types";

import { useResourceBackNavigation } from "./useResourceBackNavigation";

export interface ResourcePageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string | (() => void);
  backLabel?: ReactNode;
  extraActions?: ReactNode;
  className?: string;
}

export const ResourcePageHeader = memo(function ResourcePageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  backTo,
  backLabel = "Back",
  extraActions,
  className,
}: ResourcePageHeaderProps) {
  const handleBack = useResourceBackNavigation(backTo);
  const backTitle = typeof backLabel === "string" ? backLabel : "Back";

  return (
    <div className={cn("flex flex-col gap-3 border-b border-border/70 pb-5", className)}>
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const itemKey = item.href
              ? `${item.href}-${index}`
              : `${typeof item.label === "string" ? item.label : index}`;
            return (
              <div key={itemKey} className="flex items-center gap-1.5">
                {index > 0 ? <ChevronRight className="text-muted-foreground/60 size-3 shrink-0" /> : null}
                {item.href && !isLast ? (
                  <Link
                    href={item.href as Route}
                    className="hover:text-foreground font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(isLast && "font-semibold text-foreground")}>{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
      ) : null}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:items-center">
          {backTo ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground mt-0.5 -ml-2 rounded-lg sm:mt-0"
              title={backTitle}
              aria-label={backTitle}
            >
              <ArrowLeft className="size-4" />
            </Button>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
              {badge ? <div>{badge}</div> : null}
            </div>
            {description ? (
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{description}</p>
            ) : null}
          </div>
        </div>

        {extraActions ? (
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">{extraActions}</div>
        ) : null}
      </div>
    </div>
  );
});
