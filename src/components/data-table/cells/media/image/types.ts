import type React from "react";

import type { BaseCellProps } from "../../base";

export type ImagePlaceholderType = "product" | "document" | "avatar" | "generic";

export interface ImageCellProps extends BaseCellProps {
  /** 图片 URL 或图片 URL 数组 */
  src?: string | string[] | null;
  /** 图片替代文本 */
  alt?: string;
  /** 宽度规格或自定义 CSS 像素 */
  width?: number | string;
  /** 高度规格或自定义 CSS 像素 */
  height?: number | string;
  /** 预设尺寸规格，默认 'md' */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** 形状外观，默认 'rounded' */
  shape?: "rounded" | "square" | "circle";
  /** 画面比例，默认 'square' */
  aspectRatio?: "square" | "video" | "wide" | "auto";
  /** 裁剪填充方式，默认 'cover' */
  objectFit?: "cover" | "contain" | "fill";
  /** 是否开启点击大图预览 (Lightbox)，默认 true */
  preview?: boolean;
  /** 多图最多堆叠显示数量，超出显示 +N，默认 3 */
  maxStacked?: number;
  /** 语义化预设空占位符类型，默认 'generic' */
  placeholderType?: ImagePlaceholderType;
  /** 多图预览是否开启画廊轮播模式，默认 true */
  gallery?: boolean;
  /** 自定义降级占位图或图标 */
  fallback?: React.ReactNode;
  /** 气泡提示 */
  tooltip?: React.ReactNode;
}
