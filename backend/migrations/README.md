# migrations

本地开发由 `app/main.py:lifespan` 自动 `create_all` 建表。

生产环境按需执行 `uv run alembic init migrations` 后把 `env.py` 接到
`app.infrastructure.db.models` 的 `SQLModel.metadata` 上，本目录届时由 alembic 接管。
