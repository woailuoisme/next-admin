import type { FileUploadItem, FileUploadValue } from "./types";

export const DEFAULT_MAX_FILES = 10;
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export type UploadTransportResult =
  | string
  | {
      url: string;
      name?: string;
      size?: number;
      type?: string;
    };

export interface UploadTransportContext {
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export interface UploadTransport {
  upload: (file: File, context: UploadTransportContext) => Promise<UploadTransportResult>;
}

export interface FileValueCodec<TValue = FileUploadValue | null> {
  decode: (value: unknown) => FileUploadItem[];
  encode: (items: FileUploadItem[], mode: "grid" | "avatar") => TValue;
}

export type FileValidationFailureReason = "type" | "size" | "limit";

export interface ValidateFilesOptions {
  accept?: string;
  maxSize: number;
  maxFiles: number;
  currentCount: number;
  mode: "grid" | "avatar";
  multiple?: boolean;
}

export interface RejectedFileCandidate {
  file: File;
  reason: FileValidationFailureReason;
}

export interface ValidateFilesResult {
  accepted: File[];
  rejected: RejectedFileCandidate[];
}

type LooseFileItem = Partial<FileUploadItem> & { url: string };

/**
 * 将表单值统一归一化为 FileUploadItem 数组，兼容字符串、字符串数组及结构化对象。
 */
export function normalizeToItems(value: unknown): FileUploadItem[] {
  if (!value) return [];
  if (typeof value === "string") {
    return [
      {
        id: value,
        name: value.split("/").pop() || "uploaded-file",
        url: value,
        status: "done",
      },
    ];
  }
  if (Array.isArray(value)) {
    return value
      .map((item, idx): FileUploadItem | null => {
        if (typeof item === "string") {
          return {
            id: `${item}-${idx}`,
            name: item.split("/").pop() || `file-${idx + 1}`,
            url: item,
            status: "done",
          };
        }
        if (typeof item === "object" && item !== null && "url" in item) {
          const raw = item as LooseFileItem;
          return {
            id: raw.id || raw.url || `item-${idx}`,
            name: raw.name || "uploaded-file",
            size: raw.size,
            url: raw.url,
            type: raw.type,
            status: raw.status || "done",
            progress: raw.progress,
            error: raw.error,
          };
        }
        return null;
      })
      .filter((item): item is FileUploadItem => item !== null);
  }
  if (typeof value === "object" && value !== null && "url" in value) {
    const raw = value as LooseFileItem;
    return [
      {
        id: raw.id || raw.url,
        name: raw.name || "uploaded-file",
        size: raw.size,
        url: raw.url,
        type: raw.type,
        status: raw.status || "done",
        progress: raw.progress,
        error: raw.error,
      },
    ];
  }
  return [];
}

/**
 * 对象条目编解码器：直接提交结构化 FileUploadItem / FileUploadItem[]。
 */
export const itemFileValueCodec: FileValueCodec<FileUploadItem | FileUploadItem[] | null> = {
  decode: normalizeToItems,
  encode: (items, mode) => (mode === "avatar" ? (items[0] ?? null) : items),
};

/**
 * URL 字符串编解码器：仅输出已完成上传的有效 URL（string / string[]），隔离上传中与失败态，杜绝脏数据提交。
 */
export const urlFileValueCodec: FileValueCodec<string | string[]> = {
  decode: normalizeToItems,
  encode: (items, mode) => {
    const committedUrls = items
      .filter((item) => item.status !== "error" && item.status !== "uploading" && Boolean(item.url))
      .map((item) => item.url);
    if (mode === "avatar") {
      return committedUrls[0] ?? "";
    }
    return committedUrls;
  },
};

export function resolveFileCodec(codec?: "item" | "url" | FileValueCodec): FileValueCodec {
  if (!codec || codec === "item") return itemFileValueCodec;
  if (codec === "url") return urlFileValueCodec;
  return codec;
}

/**
 * 校验文件是否符合 HTML input accept 规则（支持扩展名 `.pdf`、通配 MIME `image/*` 与精确 MIME）。
 */
export function matchesAccept(file: Pick<File, "name" | "type">, accept?: string): boolean {
  if (!accept || !accept.trim()) return true;
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const fileName = file.name.toLowerCase();
  const mimeType = (file.type || "").toLowerCase();

  return tokens.some((token) => {
    if (token === "*/*") return true;
    if (token.startsWith(".")) {
      return fileName.endsWith(token);
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      return mimeType.startsWith(prefix);
    }
    return mimeType === token;
  });
}

/**
 * 统一校验待上传候选文件列表，分离通过队列与失败原因。
 */
export function validateCandidateFiles(files: File[], options: ValidateFilesOptions): ValidateFilesResult {
  const { accept, maxSize, maxFiles, currentCount, mode, multiple } = options;
  const accepted: File[] = [];
  const rejected: RejectedFileCandidate[] = [];

  const remainingSlots =
    mode === "avatar" ? 1 : multiple === false ? (currentCount === 0 ? 1 : 0) : Math.max(0, maxFiles - currentCount);

  for (const file of files) {
    if (!matchesAccept(file, accept)) {
      rejected.push({ file, reason: "type" });
      continue;
    }
    if (file.size > maxSize) {
      rejected.push({ file, reason: "size" });
      continue;
    }
    if (accepted.length >= remainingSlots) {
      rejected.push({ file, reason: "limit" });
      continue;
    }
    accepted.push(file);
  }

  return { accepted, rejected };
}

export function normalizeUploadResult(result: UploadTransportResult, fallbackFile: File) {
  if (typeof result === "string") {
    return {
      url: result,
      name: fallbackFile.name,
      size: fallbackFile.size,
      type: fallbackFile.type,
    };
  }
  return {
    url: result.url,
    name: result.name || fallbackFile.name,
    size: result.size ?? fallbackFile.size,
    type: result.type || fallbackFile.type,
  };
}

/**
 * 不可变归并单个文件项更新，保证并发上传或删除时不覆盖邻近条目状态。
 */
export function mergeUploadedItems(
  items: FileUploadItem[],
  targetId: string,
  patch: Partial<FileUploadItem>,
): FileUploadItem[] {
  let matched = false;
  const next = items.map((item) => {
    if (item.id !== targetId) return item;
    matched = true;
    return { ...item, ...patch };
  });
  return matched ? next : items;
}

/**
 * 将传统 `onUpload(file)` 回调包装为支持取消信号与进度报告的标准 UploadTransport 适配器。
 */
export function createLegacyUploadTransport(
  onUpload?: (file: File) => Promise<UploadTransportResult>,
): UploadTransport {
  if (onUpload) {
    return {
      async upload(file, { signal, onProgress }) {
        if (signal.aborted) {
          throw new DOMException("Upload aborted", "AbortError");
        }
        onProgress(35);
        const result = await onUpload(file);
        if (signal.aborted) {
          throw new DOMException("Upload aborted", "AbortError");
        }
        onProgress(100);
        return result;
      },
    };
  }

  return {
    async upload(file, { signal, onProgress }) {
      onProgress(40);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          signal.removeEventListener("abort", handleAbort);
          resolve();
        }, 350);

        const handleAbort = () => {
          clearTimeout(timer);
          reject(new DOMException("Upload aborted", "AbortError"));
        };

        if (signal.aborted) {
          handleAbort();
        } else {
          signal.addEventListener("abort", handleAbort, { once: true });
        }
      });
      onProgress(100);
      return URL.createObjectURL(file);
    },
  };
}
