import { queryOptions } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api";

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: () => unwrap(api.GET("/api/v1/users/me")),
});

export function login(username: string, password: string) {
  return unwrap(api.POST("/api/v1/auth/login", { body: { username, password } }));
}

export function register(username: string, password: string) {
  return unwrap(api.POST("/api/v1/auth/register", { body: { username, password } }));
}
