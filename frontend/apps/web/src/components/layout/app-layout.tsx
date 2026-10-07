import { Button } from "@repo/ui/components/button";
import { ThemeToggle } from "@repo/ui/components/theme-toggle";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { clearToken } from "@/features/auth/token";

export function AppLayout({ username, children }: { username: string; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function logout() {
    clearToken();
    queryClient.clear();
    void navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <span className="font-semibold">用户前台</span>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-sm text-muted-foreground">{username}</span>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={logout} aria-label="退出登录">
            <LogOut />
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
