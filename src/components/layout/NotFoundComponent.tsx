"use client";

import { useTranslations } from "next-intl";

import Link from "next/link";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { progress } from "@/lib/progress";

export interface NotFoundComponentProps {
  code?: string;
  title?: string;
  description?: string;
  backText?: string;
  homeText?: string;
}

/**
 * 全局统一 404 / 资源不存在组件 (NotFoundComponent)
 * 当 Next.js 遇到无法匹配的路由或显示抛出 notFound() 时触发
 */
export function NotFoundComponent({ code, title, description, backText, homeText }: NotFoundComponentProps = {}) {
  const t = useTranslations("layout");

  // 404 页面触发时重置路由加载进度条，避免处于加载假死状态
  useEffect(() => {
    progress.reset();
  }, []);

  const effectiveCode = code ?? t("not_found_code");
  const effectiveTitle = title ?? t("not_found_title");
  const effectiveDescription = description ?? t("not_found_desc");
  const effectiveBackText = backText ?? t("not_found_back");
  const effectiveHomeText = homeText ?? t("not_found_home");

  return (
    <div aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="bg-muted/60 text-muted-foreground mb-4 flex size-16 items-center justify-center rounded-full shadow-xs">
        <FileQuestion aria-hidden="true" className="size-8" />
      </div>
      <span className="text-primary mb-1 text-sm font-semibold tracking-wider uppercase">{effectiveCode}</span>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">{effectiveTitle}</h1>
      <p className="text-muted-foreground mb-6 max-w-md text-sm">{effectiveDescription}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
          className="cursor-pointer gap-2"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {effectiveBackText}
        </Button>
        <Button asChild className="cursor-pointer gap-2">
          <Link href="/">
            <Home aria-hidden="true" className="size-4" />
            {effectiveHomeText}
          </Link>
        </Button>
      </div>
    </div>
  );
}
