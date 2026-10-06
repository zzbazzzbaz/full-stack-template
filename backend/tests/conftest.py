import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlmodel import SQLModel

from app.api.dependencies import get_session
from app.api.routes import api_router
from app.core.config import get_settings
from app.infrastructure.db.engine import create_engine, prepare_test_database
from app.infrastructure.db.session import create_session_factory


@pytest_asyncio.fixture
async def session():
    """测试读 `.env`（唯一来源），连 DATABASE_URL 派生的 `<db>_test` 库。

    自动建库 + 每次重建表，不污染开发库；禁止在测试里硬编码环境变量。
    """
    get_settings.cache_clear()
    settings = get_settings()
    test_url = await prepare_test_database(settings.database_url)
    engine = create_engine(
        test_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    factory = create_session_factory(engine)
    async with factory() as s:
        yield s
    await engine.dispose()


@pytest_asyncio.fixture
async def client(session):
    app = FastAPI()
    app.include_router(api_router, prefix="/api/v1")

    async def override_session():
        yield session

    app.dependency_overrides[get_session] = override_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
