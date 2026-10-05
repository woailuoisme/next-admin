/**
 * 工业级 RESTful API 全局响应协议规范 (对齐 API.md 标准)
 *
 * 遵循 Stripe / Google Cloud AIP / JSON:API 标准，
 * 废除冗余的 success/code 包装，HTTP 状态码表征传输状态，Body 聚焦数据与结构化错误。
 */

/** 基础基于 Offset/Page 的分页元数据 */
export interface ApiPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

/** 基于游标 (Cursor) 的分页元数据 (适用于流日志、无限滚动) */
export interface ApiCursorMeta {
  hasMore: boolean;
  nextCursor?: string | null;
  prevCursor?: string | null;
}

/** 单实体/业务对象标准响应包裹 (HTTP 200/201) */
export interface ApiResponse<T> {
  data: T;
}

/** 集合分页标准响应包裹 (HTTP 200) */
export interface ApiPaginatedResponse<T, TMeta = ApiPaginationMeta> {
  data: T[];
  meta: TMeta;
}

/** 游标分页标准响应包裹 (HTTP 200) */
export interface ApiCursorPaginatedResponse<T> {
  data: T[];
  meta: ApiCursorMeta;
}

/** 结构化错误明细定义 (对齐 API.md 第 4.2 节) */
export interface ApiErrorDetail {
  code: string;
  message: string;
  /** 字段级校验异常明细 (主要用于 HTTP 422 UNPROCESSABLE_ENTITY) */
  fields?: Record<string, string[]>;
  /** 错误关联的追踪链路 ID */
  traceId?: string;
}

/** 全局统一错误响应体 */
export interface ApiErrorResponse {
  error: ApiErrorDetail;
}
