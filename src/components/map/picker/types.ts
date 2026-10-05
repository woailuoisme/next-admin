import type { BasemapPreset } from "../presets/basemaps";
import type { CoordinateSystem } from "../utils/coordinates";

export type LocationPickerValue = {
  lng: number;
  lat: number;
  address?: string;
};

export type LocationPickerProps = {
  /**
   * `value` / `onChange` 的坐标系（默认 WGS84）
   *
   * 地图渲染坐标系由底图决定（高德为 GCJ-02，其余为 WGS84），组件内部自动双向转换，
   * 因此外部无需关心底图差异。
   */
  coordinateSystem?: CoordinateSystem;
  /** Current coordinates value: { lng, lat, address? } */
  value?: LocationPickerValue;
  /** Default coordinates value if uncontrolled */
  defaultValue?: LocationPickerValue;
  /** Callback triggered when location is picked or dragged */
  onChange?: (value: LocationPickerValue) => void;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the picker is read-only (coordinates cannot be changed) */
  readOnly?: boolean;
  /** Whether to show manual numeric lng/lat inputs below the map (default: true) */
  showCoordinatesInput?: boolean;
  /**
   * 是否显示地名搜索框（默认 true）
   *
   * 依赖高德 Web 服务 API：未配置 `NEXT_PUBLIC_AMAP_KEY` 时输入框会禁用并提示，而非静默失效。
   */
  showAddressSearch?: boolean;
  /** Whether to show the clear/reset button (default: true) */
  showReset?: boolean;
  /** Map view height (default: 320) */
  height?: number | string;
  /** Initial view center [lng, lat]，坐标系与底图一致（高德底图请传 GCJ-02） */
  center?: [number, number];
  /** Initial view zoom (default: 12) */
  zoom?: number;
  /** Basemap preset (default: "amap" —— 默认高德底图) */
  basemap?: BasemapPreset;
  /** Custom vector style URL */
  customStyleUrl?: { light?: string; dark?: string };
  /** Additional container class */
  className?: string;
};
