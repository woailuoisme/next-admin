import { SidebarHeader as BaseSidebarHeader } from "@/components/ui/sidebar";

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  logoText?: string;
}

export function SidebarHeader({
  title = "TanStack Admin",
  subtitle = "Enterprise Dashboard",
  logoText = "TS",
}: SidebarHeaderProps) {
  return (
    <BaseSidebarHeader className="border-sidebar-border/60 h-14 justify-center border-b px-3 group-data-[collapsible=icon]:px-0">
      <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
        <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold shadow-xs">
          {logoText}
        </div>
        <div className="flex flex-col overflow-hidden leading-none group-data-[collapsible=icon]:hidden">
          <span className="text-sidebar-foreground text-sm font-semibold tracking-tight">
            {title}
          </span>
          <span className="text-muted-foreground mt-0.5 text-[11px]">{subtitle}</span>
        </div>
      </div>
    </BaseSidebarHeader>
  );
}
