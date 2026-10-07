import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // 后端（:8000）需要先自行启动，这两个 webServer 只负责前端
  webServer: [
    {
      command: "npm run dev -w apps/web",
      url: "http://localhost:5173/login",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -w apps/admin",
      url: "http://localhost:5174/login",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
