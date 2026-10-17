import { Card } from "@/components/ui/card";
import { FEATURE_HIGHLIGHTS } from "../constants";

export function ChartsFeatureHighlights() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {FEATURE_HIGHLIGHTS.map(({ icon: Icon, iconClass, title, description }) => (
        <Card key={title} className="border-border/60 bg-muted/30 flex items-center gap-3 p-3.5">
          <div className={`rounded-md p-2 ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <div className="text-foreground font-semibold">{title}</div>
            <div className="text-muted-foreground">{description}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
