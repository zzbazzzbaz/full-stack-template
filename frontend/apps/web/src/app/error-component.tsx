import { toErrorMessage } from "@repo/api-client";
import { Button } from "@repo/ui/components/button";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

/** 路由级错误兜底：loader / 渲染出错时替代 TanStack 默认英文错误页。 */
export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">页面加载失败</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {toErrorMessage(error, "请检查网络后重试")}
      </p>
      <Button
        variant="outline"
        onClick={() => {
          // reset 只清错误边界状态；invalidate 才会重跑 loader 并重新渲染
          void router.invalidate();
          reset();
        }}
      >
        重试
      </Button>
    </div>
  );
}
