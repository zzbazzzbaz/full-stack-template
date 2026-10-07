# Frontend AGENTS

## 命令（全部在 `frontend/` 下执行）

- 安装：`npm install`
- 开发：`npm run dev`（同时起 web :5173 和 admin :5174；后端需先跑在 :8000）
- 类型检查：`npm run typecheck`
- Lint / 格式化：`npm run lint` / `npm run format`
- 构建：`npm run build`
- 生成接口类型：`npm run gen:api`（需要后端运行，产物是 `packages/api-client/src/schema.d.ts`，提交进仓库）
- E2E：先启动后端，再 `npm run e2e`（Playwright 会自动起两个前端 dev server）

## 结构

- `apps/web`：用户前台；`apps/admin`：后台管理。都是 Vite SPA + TanStack Router（文件路由）
- `packages/ui`：共享 shadcn/ui 组件与主题（新增组件在 `packages/ui` 下跑 `npx shadcn add <name>`）
- `packages/api-client`：OpenAPI 生成的类型 + openapi-fetch 封装
- 根目录 `tsconfig.base.json` / `tsconfig.react.json`：所有 workspace 共享（相对路径 extends）

单应用内部：

- `app/`：装配（router、providers、全局样式），不放业务
- `routes/`：文件路由，只做组合（挂哪个页面、守卫）；`_auth/route.tsx` 是登录守卫层
- `features/`：业务域（组件 + queries + 状态），增删功能只动一个目录
- `components/`：跨 feature 的通用组件；`lib/`：api 实例与工具

## 约定

- 请求一律走 `@/lib/api` 的 `api` 实例 + `unwrap()`，不直接 fetch；错误文案统一用 `toErrorMessage(error, fallback)`
- 错误反馈：mutation 失败由 QueryClient 全局 `onError` 统一 toast（`app/providers.tsx`），功能里只在需要定制文案时覆盖；query 错误在页面内展示；路由级错误由 `defaultErrorComponent`（`app/error-component.tsx`）兜底
- 服务器数据一律用 TanStack Query；纯 UI 状态（主题）用 `@repo/ui/hooks/use-theme`，不引额外状态库
- 表单用 RHF + Zod，校验规则写在组件顶部
- `src/routeTree.gen.ts` 由插件生成，提交进仓库（保证没有 dev server 时也能 typecheck）
- UI 文案使用中文
