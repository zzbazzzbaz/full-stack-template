import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { login } from "@/features/auth/api";
import { setToken } from "@/features/auth/token";

const loginSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function onSubmit(values: LoginFormValues) {
    try {
      const token = await login(values.username, values.password);
      setToken(token.access_token);
      queryClient.clear();
      await navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>欢迎回来</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4" noValidate>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "登录中…" : "登录"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          还没有账号？
          <Link to="/register" className="text-foreground underline underline-offset-4">
            去注册
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
