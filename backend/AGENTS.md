# Backend AGENTS

## 命令

- 安装：`uv sync`
- 初始化数据库/迁移：`uv run alembic upgrade head`；改模型后 `uv run alembic revision --autogenerate -m "描述"` 生成迁移
- 创建管理员：`uv run python -m scripts.create_admin <username> [password]`
- Lint：`uv run ruff check .` / `uv run ruff format --check .`
- 类型：`uv run ty check`
- 测试：`uv run pytest`（读 `.env`，连 `DATABASE_URL` 派生的 `<db>_test` 库，自动建库 + 每次重建表；禁止在测试里硬编码 `os.environ`）
- 启动：`uv run fastapi run`（entrypoint 见 pyproject.toml）

## 分层（单向，禁止反向 import）

```text
core → infrastructure → services → api
```

- `api`：解析参数、调 service、异常转 HTTP（DomainError → 状态码统一映射在 `app/api/error_handlers.py`，route 不写 try/except）、返回 schema。禁止业务判断、禁止写查询。
- `services`：领域规则、事务、授权。禁止 HTTP 概念（HTTPException、Request、Depends）；业务异常抛 `app/services/errors.py` 的 DomainError（带稳定 `code`，前端据此映射文案）。
- `infrastructure`：数据库、外部系统适配。禁止业务规则，禁止依赖 `services` / `api`。
- `core`：配置、密钥、令牌。禁止依赖任何上层。
