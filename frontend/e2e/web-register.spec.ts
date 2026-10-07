import { expect, test } from "@playwright/test";

test("注册后自动登录并进入首页", async ({ page }) => {
  const username = `e2e_${Date.now().toString(36)}`;

  await page.goto("http://localhost:5173/register");
  await page.getByLabel("用户名").fill(username);
  await page.getByLabel("密码").fill("secret123");
  await page.getByRole("button", { name: "注册" }).click();

  await expect(page).toHaveURL("http://localhost:5173/");
  await expect(page.getByRole("heading", { name: `你好，${username}` })).toBeVisible();
});
