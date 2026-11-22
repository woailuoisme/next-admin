import type { Coordinates, MapCardSlotProps, MapCommonProps, MapFeedbackProps } from "../shared/types";
import type { CoordinateSystem } from "../utils/coordinates";

export interface ArcFlightItem {
  id: string;
  from: Coordinates;
  to: Coordinates;
  fromLabel?: string;
  toLabel?: string;
  fromName?: string;
  toName?: string;
  value?: number;
  label?: string;
  category?: string;
  color?: string;
}

export interface ArcFlightMapProps extends MapCommonProps, MapFeedbackProps {
  /** 输入数据坐标系（默认 WGS84） */
  coordinateSystem?: CoordinateSystem;
  /** 流向弧线数据 */
  data: ArcFlightItem[];
  /** 弧线默认颜色 */
  arcColor?: string;
  /** 悬浮高亮颜色 */
  arcHoverColor?: string;
  /** 弧线基础线宽 */
  arcWidth?: number;
  /** 悬浮高亮线宽（默认为 arcWidth + 2） */
  hoverArcWidth?: number;
  /** 弧线默认不透明度（默认 0.72） */
  arcOpacity?: number;
  /** 弧线弯曲曲率 */
  curvature?: number;
  /** 墨卡托分段采样点数（默认 64） */
  samples?: number;
  /** 是否显示端节点呼吸标记 */
  showNodes?: boolean;
  /** 端节点尺寸 */
  nodeSize?: number;
  /** 弧线悬浮回调 */
  onArcHover?: (arc: ArcFlightItem | null) => void;
  /** 弧线点击事件 */
  onArcClick?: (arc: ArcFlightItem) => void;
  /** 卡片容器插槽配置 */
  cardProps?: MapCardSlotProps;
}
