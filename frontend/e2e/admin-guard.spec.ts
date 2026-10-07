import { expect, test } from "@playwright/test";

test("未登录访问后台会跳到登录页", async ({ page }) => {
  await page.goto("http://localhost:5174/users");

  await expect(page).toHaveURL("http://localhost:5174/login");
  await expect(page.getByText("登录管理后台")).toBeVisible();
});
