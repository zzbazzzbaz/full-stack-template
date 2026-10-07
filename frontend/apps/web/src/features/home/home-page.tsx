import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useSuspenseQuery } from "@tanstack/react-query";

import { meQueryOptions } from "@/features/auth/api";

export function HomePage() {
  const { data: me } = useSuspenseQuery(meQueryOptions);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">你好，{me.username}</h1>
        <p className="text-sm text-muted-foreground">
          模板自带的最小前台：新的页面加在 features/ 和 routes/ 里。
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardDescription>当前账号</CardDescription>
          <CardTitle className="flex items-center gap-2">
            {me.username}
            <Badge variant={me.role === "admin" ? "default" : "secondary"}>
              {me.role === "admin" ? "管理员" : "普通用户"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          注册时间：{new Date(me.created_at).toLocaleString("zh-CN")}
        </CardContent>
      </Card>
    </div>
  );
}
