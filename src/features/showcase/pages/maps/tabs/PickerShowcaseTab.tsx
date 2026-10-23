import { Sparkles } from "lucide-react";
import { useState } from "react";
import { FormLocationPicker } from "@/components/form";
import type { LocationPickerValue } from "@/components/map";
import { Card } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";

export function PickerShowcaseTab() {
  const [formPickerVal, setFormPickerVal] = useState<LocationPickerValue>({
    lng: 116.4074,
    lat: 39.9042,
    address: "Beijing City Center",
  });

  return (
    <TabsContent value="picker" className="space-y-4">
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-foreground text-base font-semibold">表单高阶组件与坐标拾取器 (FormLocationPicker)</h3>
          <p className="text-muted-foreground text-xs">
            完整适配 Filament v5 / TanStack Form 体系：快捷热门城市预设、一键复制经纬度、标点拖拽与校验反馈
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FormLocationPicker
              label="企业注册驻地经纬度"
              helperText="支持在地图上任意点击或拖拽微调定位，可点击上方城市快速定位"
              value={formPickerVal}
              onChange={setFormPickerVal}
              height={380}
              zoom={11}
              showCoordinatesInput={true}
              showReset={true}
              showAddressSearch={true}
              showCopyButton={true}
            />
          </div>

          <div className="border-border bg-muted/20 flex flex-col justify-between rounded-lg border p-4">
            <div>
              <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                TanStack Form 状态镜像
              </h4>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">经度 (Longitude)</span>
                  <span className="text-primary font-mono font-semibold">{formPickerVal.lng.toFixed(6)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">纬度 (Latitude)</span>
                  <span className="text-primary font-mono font-semibold">{formPickerVal.lat.toFixed(6)}</span>
                </div>
                {formPickerVal.address && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">地址解析</span>
                    <span className="text-foreground max-w-44 truncate text-right">{formPickerVal.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-primary/20 bg-primary/10 text-primary mt-4 rounded-md border p-2.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Sparkles className="size-3.5" />
                <span>设计系统无缝融合</span>
              </div>
              <p className="text-muted-foreground mt-1 text-[11px]">
                遵循全站 FieldWrapper 规范，支持 Zod 国际化校验报错、ColSpan 栅格排版与受控 TanStack Form 双向绑定。
              </p>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
