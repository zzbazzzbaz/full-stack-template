import { createFileRoute, redirect } from "@tanstack/react-router";

import { RegisterPage } from "@/features/auth/components/register-page";
import { getToken } from "@/features/auth/token";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterPage,
});
