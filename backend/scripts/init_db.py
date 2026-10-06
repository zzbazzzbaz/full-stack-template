"""初始化数据库：按 SQLModel metadata 建表（幂等，已存在的表不动）。

用法（在 backend/ 下执行）：
    uv run python scripts/init_db.py

配置读 `.env`（唯一来源）。生产上线请改用 alembic 迁移。
"""

import asyncio
import sys
from pathlib import Path

# 直接 `python scripts/init_db.py` 时把 backend/ 加入 sys.path，保证能 import app
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlmodel import SQLModel  # noqa: E402

import app.infrastructure.db.models  # noqa: E402,F401 - 注册所有表到 metadata
from app.core.config import get_settings  # noqa: E402
from app.infrastructure.db.engine import create_engine  # noqa: E402


async def init_db() -> None:
    settings = get_settings()
    engine = create_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print(f"database initialized: {len(SQLModel.metadata.tables)} table(s) ready")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())
