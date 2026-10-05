import { useMemoizedFn } from "ahooks";
import { RotateCcw } from "lucide-react";
import { memo, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { LocationPickerValue } from "./types";

interface LocationCoordinatesInputProps {
  value?: LocationPickerValue;
  disabled?: boolean;
  readOnly?: boolean;
  showReset?: boolean;
  onCoordinatesChange: (coords: { lng: number; lat: number }) => void;
  /**
   * 数值**未变**时按回车「确认」的回调
   *
   * 数值发生变化的情况由上层监听值变更自动定位，此处不参与，避免一次操作飞两次。
   */
  onConfirm?: () => void;
  onReset: () => void;
}

/** 数值 → 输入框草稿（保留 6 位小数并去掉尾随 0） */
function toDraft(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "";
  return String(Number(value.toFixed(6)));
}

export const LocationCoordinatesInput = memo(function LocationCoordinatesInput({
  value,
  disabled = false,
  readOnly = false,
  showReset = true,
  onCoordinatesChange,
  onConfirm,
  onReset,
}: LocationCoordinatesInputProps) {
  const baseId = useId();
  const lngId = `${baseId}-lng`;
  const latId = `${baseId}-lat`;

  // 本地草稿：输入过程中不即时写回上游（避免逐字符触发逆地理编码等下游计算），
  // 仅在「确认」时提交
  const [lngDraft, setLngDraft] = useState(() => toDraft(value?.lng));
  const [latDraft, setLatDraft] = useState(() => toDraft(value?.lat));
  const [prevLng, setPrevLng] = useState(value?.lng);
  const [prevLat, setPrevLat] = useState(value?.lat);

  // 外部值变化（地图选点 / 地名搜索 / 快捷城市 / 重置）时同步草稿
  if (value?.lng !== prevLng || value?.lat !== prevLat) {
    setPrevLng(value?.lng);
    setPrevLat(value?.lat);
    setLngDraft(toDraft(value?.lng));
    setLatDraft(toDraft(value?.lat));
  }

  const commit = useMemoizedFn((forceConfirm = false) => {
    if (disabled || readOnly) return;

    const lng = Number.parseFloat(lngDraft);
    const lat = Number.parseFloat(latDraft);

    // 任一侧非法或超出墨卡托投影有效边界则回退当前值，防止 MapLibre GL 抛错崩溃
    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -85.0511 ||
      lat > 85.0511
    ) {
      setLngDraft(toDraft(value?.lng));
      setLatDraft(toDraft(value?.lat));
      return;
    }

    const changed = lng !== value?.lng || lat !== value?.lat;
    if (changed) {
      // 值变化后的自动定位由上层统一处理（值变更 → 自动飞过去），此处不重复触发
      onCoordinatesChange({ lng, lat });
      return;
    }

    // 数值未变：仅回车视为「确认」，重新定位到当前点；单纯失焦不飞，避免 Tab 切换就动地图
    if (forceConfirm) onConfirm?.();
  });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex min-w-36 flex-1 items-center gap-2">
        <Label htmlFor={lngId} className="text-muted-foreground shrink-0 text-xs">
          经度
        </Label>
        <Input
          id={lngId}
          inputMode="decimal"
          value={lngDraft}
          disabled={disabled || readOnly}
          onChange={(event) => setLngDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(true);
            } else if (event.key === "Escape") {
              setLngDraft(toDraft(value?.lng));
            }
          }}
          onBlur={() => commit()}
          className="h-8 font-mono text-xs"
          placeholder="Longitude"
        />
      </div>

      <div className="flex min-w-36 flex-1 items-center gap-2">
        <Label htmlFor={latId} className="text-muted-foreground shrink-0 text-xs">
          纬度
        </Label>
        <Input
          id={latId}
          inputMode="decimal"
          value={latDraft}
          disabled={disabled || readOnly}
          onChange={(event) => setLatDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(true);
            } else if (event.key === "Escape") {
              setLatDraft(toDraft(value?.lat));
            }
          }}
          onBlur={() => commit()}
          className="h-8 font-mono text-xs"
          placeholder="Latitude"
        />
      </div>

      {showReset && !readOnly && !disabled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
        >
          <RotateCcw className="size-3" />
          重置
        </Button>
      ) : null}
    </div>
  );
});
