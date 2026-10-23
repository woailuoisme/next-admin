import { useTranslations } from "next-intl";
import { SidebarHeader as BaseSidebarHeader } from "@/components/ui/sidebar";

export interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  logoText?: string;
}

export function SidebarHeader({ title, subtitle, logoText }: SidebarHeaderProps) {
  const t = useTranslations("layout");
  const effectiveTitle = title ?? t("sidebar_title");
  const effectiveSubtitle = subtitle ?? t("sidebar_subtitle");
  const effectiveLogoText = logoText ?? t("sidebar_logo_text");

  return (
    <BaseSidebarHeader className="border-sidebar-border/60 h-14 justify-center border-b px-3 group-data-[collapsible=icon]:px-0">
      <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
        <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-xs">
          {effectiveLogoText}
        </div>
        <div className="flex flex-col overflow-hidden leading-none group-data-[collapsible=icon]:hidden">
          <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">{effectiveTitle}</span>
          <span className="text-muted-foreground mt-0.5 text-[11px]">{effectiveSubtitle}</span>
        </div>
      </div>
    </BaseSidebarHeader>
  );
}
