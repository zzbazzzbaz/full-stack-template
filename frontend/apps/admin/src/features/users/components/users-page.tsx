import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardFooter } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { meQueryOptions } from "@/features/auth/api";
import { useChangeRoleMutation, usersQueryOptions } from "@/features/users/queries";
import { toErrorMessage } from "@/lib/api";
import { UsersTable } from "./users-table";

const PAGE_SIZE = 10;

export function UsersPage() {
  const [offset, setOffset] = useState(0);
  const { data: me } = useSuspenseQuery(meQueryOptions);
  const { data, isLoading, isError, error } = useQuery(usersQueryOptions(offset, PAGE_SIZE));
  const changeRole = useChangeRoleMutation();

  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <span className="text-sm text-muted-foreground">共 {total} 个用户</span>
      </div>
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {toErrorMessage(error, "加载失败")}
            </p>
          ) : (
            <UsersTable
              users={data?.items ?? []}
              meId={me.id}
              pendingUserId={changeRole.isPending ? (changeRole.variables?.userId ?? null) : null}
              onChangeRole={(user, role) => changeRole.mutate({ userId: user.id, role })}
            />
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm text-muted-foreground">
            {total === 0
              ? "暂无数据"
              : `第 ${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} 条，共 ${total} 条`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              下一页
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
