export type CellAlignment = "left" | "center" | "right";

export interface BaseCellProps {
  className?: string;
  align?: CellAlignment;
}

export const JUSTIFY_ALIGN_CLASSES: Record<CellAlignment, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export const TEXT_ALIGN_CLASSES: Record<CellAlignment, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

/** 纵向堆叠容器（flex-col）的交叉轴与文本对齐映射 */
export const STACK_ALIGN_CLASSES: Record<CellAlignment, string> = {
  left: "justify-start text-left items-start",
  center: "justify-center text-center items-center",
  right: "justify-end text-right items-end",
};
