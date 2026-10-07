from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.api.error_handlers import register_error_handlers
from app.services.errors import DomainError, NotFoundError

PASSWORD = "secret123"


async def test_route_errors_use_unified_body(client):
    """真实路由：业务异常统一转为 {"detail": str}，route 内不再 try/except。"""
    payload = {"username": "alice", "password": PASSWORD}
    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201, r.text

    # 重复注册 → 409（由 AlreadyExistsError 映射）
    r = await client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 409, r.text
    assert isinstance(r.json()["detail"], str)

    # 凭证错误 → 401（由 InvalidCredentialsError 映射）
    r = await client.post("/api/v1/auth/login", json={"username": "alice", "password": "wrongpass"})
    assert r.status_code == 401, r.text
    assert isinstance(r.json()["detail"], str)


async def test_unmapped_domain_error_is_generic_500():
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/mapped")
    async def _mapped() -> None:
        raise NotFoundError("user 999 not found")

    @app.get("/unmapped")
    async def _unmapped() -> None:
        raise DomainError("db exploded: secret dsn")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        r = await c.get("/mapped")
        assert r.status_code == 404, r.text
        assert r.json() == {"detail": "user 999 not found"}

        # 未登记的子类 → 500 且不泄露异常信息
        r = await c.get("/unmapped")
        assert r.status_code == 500, r.text
        assert r.json() == {"detail": "internal server error"}
