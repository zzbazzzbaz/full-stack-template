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
cp .env.example .env          # 填 DATABASE_URL / JWT_SECRET（openssl rand -hex 32 生成）
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

## 日常开发

完整命令、结构约定、分层规则都在各端 AGENTS 里维护（也是给 AI 的说明），README 只保留起步流程：

- 后端：[`backend/AGENTS.md`](./backend/AGENTS.md)
- 前端：[`frontend/AGENTS.md`](./frontend/AGENTS.md)

## 加一个新功能（示例流程）

1. 后端：模型 → `alembic revision --autogenerate` → service → route → schema → 测试
2. 前端：`npm run gen:api` 更新类型 → 新建 `apps/admin/src/features/<域>/`（queries + components）→ 在 `src/routes/` 加薄路由
