import { Building2, Phone } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";

import type { LocationMarkerItem } from "./types";

interface LocationMarkerPopupProps {
  item: LocationMarkerItem;
}

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  warning: "secondary",
  inactive: "outline",
};

export const LocationMarkerPopup = memo(function LocationMarkerPopup({ item }: LocationMarkerPopupProps) {
  // 卡片外观（底色 / 描边 / 圆角 / 阴影 / 12px 内边距）由 ui/map 的 MarkerPopup 容器自带
  // （`bg-popover ... rounded-md border p-3 shadow-md`），此处只负责内容排版。
  // 若在此再加一层卡片样式，会与容器形成「双层边框 + 双阴影」。
  return (
    <div className="w-64 space-y-2.5 p-1 text-xs select-none">
      <div className="flex items-start justify-between gap-2">
        <div className="text-foreground text-sm leading-tight font-semibold">{item.title}</div>
        {item.status ? (
          <Badge variant={STATUS_BADGE_VARIANTS[item.status] ?? "outline"} className="shrink-0 text-[10px]">
            {item.status}
          </Badge>
        ) : null}
      </div>

      {item.address ? (
        <div className="text-muted-foreground flex items-start gap-1.5">
          <Building2 className="mt-0.5 size-3.5 shrink-0" />
          <span className="leading-tight">{item.address}</span>
        </div>
      ) : null}

      {item.phone ? (
        <div className="text-muted-foreground flex items-center gap-1.5">
          <Phone className="size-3.5 shrink-0" />
          <span>{item.phone}</span>
        </div>
      ) : null}

      {item.description ? (
        <p className="border-border/40 text-muted-foreground/90 border-t pt-1.5 text-[11px]">{item.description}</p>
      ) : null}

      <div className="border-border/50 text-muted-foreground flex items-center justify-between gap-2 border-t pt-1.5 font-mono text-[10px]">
        <span>
          {item.coordinates[0].toFixed(4)}, {item.coordinates[1].toFixed(4)}
        </span>
        {item.category ? (
          <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-sans font-medium">
            {item.category}
          </span>
        ) : null}
      </div>
    </div>
  );
});
