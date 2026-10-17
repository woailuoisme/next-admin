import { Button } from "@/components/ui/button";

interface InfolistHeaderBarProps {
  orientation: "vertical" | "horizontal";
  dense: boolean;
  onOrientationChange: (orientation: "vertical" | "horizontal") => void;
  onDenseToggle: () => void;
}

export function InfolistHeaderBar({
  orientation,
  dense,
  onOrientationChange,
  onDenseToggle,
}: InfolistHeaderBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Infolists & Callouts Showcase</h1>
          <span className="border-primary/20 bg-primary/10 text-primary rounded-md border px-2 py-0.5 text-xs font-semibold">
            Filament v5 Standard
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          对标 Filament v5 Infolists 与 Callouts 规范，全站统一的只读数据展示系统与提示卡片套件。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={orientation === "vertical" ? "default" : "outline"}
          size="sm"
          className="h-8 cursor-pointer text-xs"
          onClick={() => onOrientationChange("vertical")}
        >
          上下堆叠
        </Button>
        <Button
          variant={orientation === "horizontal" ? "default" : "outline"}
          size="sm"
          className="h-8 cursor-pointer text-xs"
          onClick={() => onOrientationChange("horizontal")}
        >
          行内水平
        </Button>
        <Button
          variant={dense ? "default" : "outline"}
          size="sm"
          className="h-8 cursor-pointer text-xs"
          onClick={onDenseToggle}
        >
          {dense ? "紧凑模式" : "宽松排版"}
        </Button>
      </div>
    </div>
  );
}
