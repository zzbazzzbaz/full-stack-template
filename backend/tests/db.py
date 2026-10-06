"""测试库工具：从 .env 的 DATABASE_URL 派生独立测试库，避免污染开发库。

仅测试使用；本文件是 sqlalchemy import 的例外之一（见 pyproject per-file-ignores）。
"""

from sqlalchemy import text
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import create_async_engine


def test_database_url(database_url: str, *, suffix: str = "_test") -> str:
    """由正式库 URL 派生测试库 URL（默认库名 + `_test`），.env 仍是唯一来源。"""
    url = make_url(database_url)
    if not url.database:
        raise ValueError("DATABASE_URL 缺少库名，无法派生测试库")
    return url.set(database=f"{url.database}{suffix}").render_as_string(hide_password=False)


async def prepare_test_database(database_url: str, *, suffix: str = "_test") -> str:
    """派生测试库，不存在则自动建库，返回测试库 URL（测试专用）。"""
    test_url = test_database_url(database_url, suffix=suffix)
    url = make_url(test_url)
    maint_url = url.set(database="postgres").render_as_string(hide_password=False)
    admin = create_async_engine(maint_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin.connect() as conn:
            exists = (
                await conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :name"),
                    {"name": url.database},
                )
            ).scalar()
            if not exists:
                await conn.execute(text(f'CREATE DATABASE "{url.database}"'))
    finally:
        await admin.dispose()
    return test_url
