import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, unwrap } from "@/lib/api";

export const usersQueryOptions = (offset: number, limit: number) =>
  queryOptions({
    queryKey: ["users", { offset, limit }],
    queryFn: () => unwrap(api.GET("/api/v1/users", { params: { query: { offset, limit } } })),
  });

export function useChangeRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: "user" | "admin" }) =>
      unwrap(
        api.PATCH("/api/v1/users/{user_id}/role", {
          params: { path: { user_id: userId } },
          body: { role },
        }),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("角色已更新");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "操作失败");
    },
  });
}
