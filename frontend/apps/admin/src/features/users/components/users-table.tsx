import type { components } from "@repo/api-client";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";

export type AdminUser = components["schemas"]["UserResponse"];

const features = tableFeatures({});

interface UsersTableProps {
  users: AdminUser[];
  meId: number;
  pendingUserId: number | null;
  onChangeRole: (user: AdminUser, role: "user" | "admin") => void;
}

export function UsersTable({ users, meId, pendingUserId, onChangeRole }: UsersTableProps) {
  const columns = useMemo(() => {
    const helper = createColumnHelper<typeof features, AdminUser>();
    return helper.columns([
      helper.accessor("username", {
        header: "用户名",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      helper.accessor("role", {
        header: "角色",
        cell: (info) => (
          <Badge variant={info.getValue() === "admin" ? "default" : "secondary"}>
            {info.getValue() === "admin" ? "管理员" : "普通用户"}
          </Badge>
        ),
      }),
      helper.accessor("created_at", {
        header: "注册时间",
        cell: (info) => (
          <span className="text-muted-foreground">
            {new Date(info.getValue()).toLocaleString("zh-CN")}
          </span>
        ),
      }),
      helper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const user = info.row.original;
          const isSelf = user.id === meId;
          const pending = pendingUserId === user.id;
          const nextRole = user.role === "admin" ? "user" : "admin";
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isSelf || pending}>
                    <MoreHorizontal />
                    <span className="sr-only">操作</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onChangeRole(user, nextRole)}>
                    {user.role === "admin" ? "降为普通用户" : "提升为管理员"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ]);
  }, [meId, pendingUserId, onChangeRole]);

  const table = useTable({ features, columns, data: users });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
