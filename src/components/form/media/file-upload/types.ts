import type { BaseInputProps } from "../../core";
import type { FileValueCodec, UploadTransport, UploadTransportResult } from "./pipeline";

export type { FileValueCodec, UploadTransport, UploadTransportContext, UploadTransportResult } from "./pipeline";

export interface FileUploadItem {
  id: string;
  name: string;
  size?: number;
  url: string;
  type?: string;
  progress?: number;
  status?: "uploading" | "done" | "error";
  error?: string;
}

export type FileUploadValue = string | string[] | FileUploadItem | FileUploadItem[];

export interface FileUploadInputProps extends BaseInputProps {
  value?: FileUploadValue | null;
  defaultValue?: FileUploadValue | null;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  /** 呈现模式：grid (多图/多文件网格卡片) 或 avatar (单图圆形/方圆头像) */
  mode?: "grid" | "avatar";
  /** 允许的文件类型 MIME 或后缀，例如 "image/*" 或 ".pdf,.png" */
  accept?: string;
  /** 是否支持多文件上传，mode="avatar" 时强制为 false */
  multiple?: boolean;
  /** 允许上传的最大文件数量，默认 10 */
  maxFiles?: number;
  /** 单文件最大大小限制 (字节 Bytes)，默认 10MB */
  maxSize?: number;
  /** 是否在卡片中提供文件下载按钮 */
  showDownload?: boolean;
  /** 是否在卡片中提供移除/删除按钮 */
  showRemove?: boolean;
  /** 自定义异步上传钩子，不传则使用内置本地 Mock 进度上传适配器 */
  onUpload?: (file: File) => Promise<UploadTransportResult>;
  /** 可取消与带进度通知的标准传输适配器（优先于 onUpload） */
  transport?: UploadTransport;
  /** 表单值编解码策略："item" | "url" | 自定义 FileValueCodec */
  valueCodec?: "item" | "url" | FileValueCodec;
  /** 额外的容器类名 */
  dropzoneClassName?: string;
  readOnly?: boolean;
}

export interface FileUploadCoreProps {
  id: string;
  value: unknown;
  onChange: (val: any) => void;
  onBlur?: () => void;
  mode?: "grid" | "avatar";
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  showDownload?: boolean;
  showRemove?: boolean;
  onUpload?: (file: File) => Promise<UploadTransportResult>;
  transport?: UploadTransport;
  valueCodec?: "item" | "url" | FileValueCodec;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  describedBy?: string;
  className?: string;
}
