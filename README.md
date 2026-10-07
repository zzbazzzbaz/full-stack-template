# Full Stack Template

个人全栈启动模板：FastAPI 后端 + React 前端（用户前台 + 后台管理）。

## 技术栈

| 层 | 选型 |
|---|---|
| 后端 | FastAPI / SQLModel / Alembic / PostgreSQL；uv + ruff + ty + pytest |
| 前端 | Vite + React + TypeScript；TanStack Router / Query / Table；Tailwind CSS + shadcn/ui |
| 前端工具 | npm workspaces、Biome（lint + format）、Playwright（E2E） |
| 接口契约 | 后端 OpenAPI → `openapi-typescript` 生成前端类型（`packages/api-client`） |
| 认证 | JWT Bearer（前端存 localStorage）；`role=admin` 才能进后台 |

## 目录结构

```text
.
├── backend/                  # FastAPI（core → infrastructure → services → api 分层）
│   ├── app/
│   ├── migrations/           # Alembic
│   ├── scripts/              # create_admin 等工具脚本
│   └── tests/
└── frontend/                 # npm workspaces
    ├── apps/
    │   ├── web/              # 用户前台 :5173
    │   └── admin/            # 后台管理 :5174
    ├── packages/
    │   ├── api-client/       # OpenAPI 生成的类型 + fetch 封装
    │   └── ui/               # shadcn/ui 组件 + 主题
    ├── tsconfig.*.json       # 共享 tsconfig（apps/packages 相对路径 extends）
    └── e2e/                  # Playwright
```

## 快速开始

后端（需要一个可连的 PostgreSQL）：

```bash
cd backend
cp .env.example .env          # 填 DATABASE_URL / JWT_SECRET
uv sync
uv run alembic upgrade head
uv run python -m scripts.create_admin admin yourpassword   # 创建第一个管理员
uv run fastapi run
```

前端：

```bash
cd frontend
npm install
npm run dev                   # web :5173 / admin :5174
```

- 后台管理：http://localhost:5174 （用上面创建的管理员登录）
- 用户前台：http://localhost:5173 （注册普通用户）

## 常用命令

| 位置 | 命令 | 说明 |
|---|---|---|
| backend/ | `uv run ruff check .` / `uv run ruff format --check .` | Lint / 格式检查 |
| backend/ | `uv run ty check` | 类型检查 |
| backend/ | `uv run pytest` | 测试（自动派生 `*_test` 库） |
| frontend/ | `npm run typecheck` | 两个应用 + 包的 TS 检查 |
| frontend/ | `npm run lint` / `npm run format` | Biome |
| frontend/ | `npm run gen:api` | 从运行中的后端生成接口类型 |
| frontend/ | `npm run e2e` | Playwright（先启动后端） |

## 加一个新功能（示例流程）

1. 后端：模型 → `alembic revision --autogenerate` → service → route → schema → 测试
2. 前端：`npm run gen:api` 更新类型 → 新建 `apps/admin/src/features/<域>/`（queries + components）→ 在 `src/routes/` 加薄路由
3. 共享组件：在 `frontend/packages/ui` 下 `npx shadcn add <组件名>`
