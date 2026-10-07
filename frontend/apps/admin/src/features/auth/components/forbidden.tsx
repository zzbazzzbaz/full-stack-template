import { Button } from "@repo/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { clearToken } from "@/features/auth/token";

export function Forbidden() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function logout() {
    clearToken();
    queryClient.clear();
    void navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">无权访问</h1>
      <p className="text-sm text-muted-foreground">当前账号不是管理员，请换管理员账号登录。</p>
      <Button variant="outline" onClick={logout}>
        退出登录
      </Button>
    </div>
  );
}
