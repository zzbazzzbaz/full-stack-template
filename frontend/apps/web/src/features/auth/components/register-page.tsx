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

import { login, register } from "@/features/auth/api";
import { setToken } from "@/features/auth/token";
import { toErrorMessage } from "@/lib/api";

const registerSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位").max(32, "用户名最多 32 位"),
  password: z.string().min(6, "密码至少 6 位").max(128, "密码最多 128 位"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "" },
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function onSubmit(values: RegisterFormValues) {
    try {
      await register(values.username, values.password);
      const token = await login(values.username, values.password);
      setToken(token.access_token);
      queryClient.clear();
      toast.success("注册成功");
      await navigate({ to: "/" });
    } catch (error) {
      toast.error(toErrorMessage(error, "注册失败"));
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建账号后自动登录</CardDescription>
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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "注册中…" : "注册"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          已有账号？
          <Link to="/login" className="text-foreground underline underline-offset-4">
            去登录
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
