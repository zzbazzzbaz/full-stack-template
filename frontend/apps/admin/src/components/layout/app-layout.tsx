import { Button } from "@repo/ui/components/button";
import { ThemeToggle } from "@repo/ui/components/theme-toggle";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Users } from "lucide-react";
import type { ReactNode } from "react";

import { clearToken } from "@/features/auth/token";

const navItems = [
  { to: "/", label: "仪表盘", icon: LayoutDashboard, exact: true },
  { to: "/users", label: "用户管理", icon: Users, exact: false },
] as const;

export function AppLayout({ username, children }: { username: string; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function logout() {
    clearToken();
    queryClient.clear();
    void navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-svh">
      <aside className="flex w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center border-b px-4 font-semibold">管理后台</div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{
                className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
              }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-1 border-b px-4">
          <span className="mr-1 text-sm text-muted-foreground">{username}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} aria-label="退出登录">
            <LogOut />
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
