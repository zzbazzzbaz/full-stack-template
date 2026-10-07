import createClient from "openapi-fetch";

import { messageForCode } from "./messages";
import type { paths } from "./schema";

export interface ApiClientOptions {
  /** 后端地址；默认空串，配合 Vite 代理走同源 /api。 */
  baseUrl?: string;
  getToken?: () => string | null;
  /** 收到 401 时触发（用于清 token、跳登录页）。 */
  onUnauthorized?: () => void;
}

export function createApiClient({ baseUrl = "", getToken, onUnauthorized }: ApiClientOptions = {}) {
  const client = createClient<paths>({ baseUrl });

  client.use({
    onRequest({ request }) {
      const token = getToken?.();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      return request;
    },
    onResponse({ response }) {
      if (response.status === 401) {
        onUnauthorized?.();
      }
      return response;
    },
  });

  return client;
}

export type ApiClient = ReturnType<typeof createApiClient>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FastApiErrorBody {
  detail?: string | { msg?: string }[];
  code?: string;
}

/** FastAPI 的错误响应有两种形态：字符串 detail 和校验错误数组。 */
export function errorMessage(body: unknown): string {
  const detail = (body as FastApiErrorBody | undefined)?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? JSON.stringify(item)).join("; ");
  }
  return "请求失败";
}

/** 后端 ErrorBody 的稳定错误码（DomainError.code），没有时为 undefined。 */
export function errorCode(body: unknown): string | undefined {
  const code = (body as FastApiErrorBody | undefined)?.code;
  return typeof code === "string" ? code : undefined;
}

/** 把任意抛出的值转成可展示文案：优先 code 中文映射，其次后端 detail；非 ApiError 记控制台。 */
export function toErrorMessage(error: unknown, fallback = "请求失败"): string {
  if (error instanceof ApiError) {
    return messageForCode(error.code) ?? error.message;
  }
  console.error(error);
  return fallback;
}

/** 把 openapi-fetch 的 { data, error } 结果转成"成功返回 data，失败抛 ApiError"。 */
export async function unwrap<T>(
  result: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await result;
  if (error !== undefined) {
    throw new ApiError(response.status, errorMessage(error), errorCode(error));
  }
  return data as T;
}
