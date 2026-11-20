import type { UploadAdapter } from "@uploadcn/core";

import type { BaseInputProps } from "../../core";

export type FileUploadValue = string | string[];

export interface FileUploadInputProps extends BaseInputProps {
  value?: FileUploadValue | null;
  defaultValue?: FileUploadValue | null;
  onChange?: (value: FileUploadValue | null) => void;
  onBlur?: () => void;
  /** 呈现模式：grid (多图/多文件网格卡片) 或 avatar (单图圆形头像) */
  mode?: "grid" | "avatar";
  /** 允许的文件类型 MIME 或后缀，例如 "image/*" 或 ".pdf,.png" */
  accept?: string;
  /** 是否支持多文件上传，mode="avatar" 时强制为 false */
  multiple?: boolean;
  /** 允许上传的最大文件数量，默认 10 */
  maxFiles?: number;
  /** 单文件最大大小限制 (字节 Bytes)，默认 10MB */
  maxSize?: number;
  /** 自定义 UploadCN 适配器（如 s3Adapter / cloudinaryAdapter / createAdapter），优先于 endpoint 与默认 localAdapter */
  adapter?: UploadAdapter<unknown>;
  /** HTTP 上传接口（自动封装为 UploadCN httpAdapter）；不传时默认使用官方 localAdapter() */
  endpoint?: string;
  /** HTTP 上传附加请求头 */
  headers?: Record<string, string>;
  /** 是否启用粘贴上传（Ctrl/⌘+V），默认 true */
  paste?: boolean | "global";
  /** 头像模式是否开启圆形裁剪弹窗，默认 true */
  crop?: boolean;
  /** 是否在卡片中提供文件下载按钮 */
  showDownload?: boolean;
  /** 是否在卡片中提供移除/删除按钮 */
  showRemove?: boolean;
  /** 额外的容器类名 */
  dropzoneClassName?: string;
  readOnly?: boolean;
}

export type FileUploadCoreProps = Pick<
  FileUploadInputProps,
  | "onBlur"
  | "mode"
  | "accept"
  | "multiple"
  | "maxFiles"
  | "maxSize"
  | "adapter"
  | "endpoint"
  | "headers"
  | "paste"
  | "crop"
  | "showDownload"
  | "showRemove"
  | "readOnly"
> & {
  id: string;
  value: unknown;
  onChange: (val: FileUploadValue | null) => void;
  disabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
  className?: string;
};
