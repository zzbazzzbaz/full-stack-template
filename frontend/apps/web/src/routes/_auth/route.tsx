import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/app-layout";
import { meQueryOptions } from "@/features/auth/api";
import { getToken } from "@/features/auth/token";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    if (!getToken()) {
      throw redirect({ to: "/login" });
    }
    return { me: await context.queryClient.ensureQueryData(meQueryOptions) };
  },
  component: AuthLayout,
});

function AuthLayout() {
  const { me } = Route.useRouteContext();

  return (
    <AppLayout username={me.username}>
      <Outlet />
    </AppLayout>
  );
}
