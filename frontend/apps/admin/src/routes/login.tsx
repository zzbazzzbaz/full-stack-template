import { createFileRoute, redirect } from "@tanstack/react-router";

import { LoginPage } from "@/features/auth/components/login-page";
import { getToken } from "@/features/auth/token";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
