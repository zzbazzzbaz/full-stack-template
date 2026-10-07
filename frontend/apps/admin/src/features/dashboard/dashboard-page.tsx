import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { meQueryOptions } from "@/features/auth/api";
import { usersQueryOptions } from "@/features/users/queries";

export function DashboardPage() {
  const { data: me } = useSuspenseQuery(meQueryOptions);
  const { data: usersPage } = useQuery(usersQueryOptions(0, 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">仪表盘</h1>
        <p className="text-sm text-muted-foreground">模板自带的最小后台：换成你的业务页面即可。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>用户总数</CardDescription>
            <CardTitle className="text-2xl">{usersPage?.total ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>当前账号</CardDescription>
            <CardTitle className="text-2xl">{me.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={me.role === "admin" ? "default" : "secondary"}>
              {me.role === "admin" ? "管理员" : "普通用户"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
