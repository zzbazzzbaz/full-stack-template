import { createApiClient } from "@repo/api-client";
import { queryClient } from "@/app/providers";
import { clearToken, getToken } from "@/features/auth/token";
import { API_BASE_URL } from "@/lib/env";

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getToken,
  onUnauthorized: () => {
    // 带 token 的请求 401 = 会话失效；登录接口本身 401 不在此列
    if (getToken() !== null) {
      clearToken();
      queryClient.clear();
      window.location.assign("/login");
    }
  },
});

export { ApiError, toErrorMessage, unwrap } from "@repo/api-client";
