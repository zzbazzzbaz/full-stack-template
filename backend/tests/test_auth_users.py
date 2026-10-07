from app.services.users import users_service

PASSWORD = "secret123"


async def _register(client, username: str) -> dict:
    r = await client.post(
        "/api/v1/auth/register", json={"username": username, "password": PASSWORD}
    )
    assert r.status_code == 201, r.text
    return r.json()


async def _login(client, username: str) -> dict[str, str]:
    r = await client.post("/api/v1/auth/login", json={"username": username, "password": PASSWORD})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


async def test_register_login_me(client):
    # 注册
    body = await _register(client, "alice")
    assert body["username"] == "alice"
    assert body["role"] == "user"
    assert "password_hash" not in body

    # 重复注册 → 409
    r = await client.post(
        "/api/v1/auth/register",
        json={"username": "alice", "password": PASSWORD},
    )
    assert r.status_code == 409, r.text

    # 登录失败 → 401
    r = await client.post(
        "/api/v1/auth/login",
        json={"username": "alice", "password": "wrongpass"},
    )
    assert r.status_code == 401, r.text

    # 未带 token → 401
    r = await client.get("/api/v1/users/me")
    assert r.status_code == 401, r.text

    # 登录成功 + /me
    headers = await _login(client, "alice")
    r = await client.get("/api/v1/users/me", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["username"] == "alice"
    assert r.json()["role"] == "user"


async def test_admin_routes_require_admin(client):
    await _register(client, "alice")

    # 未登录访问 admin → 401
    r = await client.get("/api/v1/users")
    assert r.status_code == 401, r.text

    # 普通用户访问 admin → 403
    headers = await _login(client, "alice")
    r = await client.get("/api/v1/users", headers=headers)
    assert r.status_code == 403, r.text


async def test_admin_list_users_and_change_role(client, session):
    await _register(client, "alice")
    await _register(client, "bob")

    # 把 alice 提升为 admin（等价于 scripts/create_admin.py）
    alice = await users_service.get_by_username(session, "alice")
    assert alice is not None
    await users_service.set_role(session, user=alice, role="admin")

    headers = await _login(client, "alice")

    # 分页列表
    r = await client.get("/api/v1/users?offset=0&limit=1", headers=headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["total"] == 2
    assert len(body["items"]) == 1

    # 修改 bob 的角色
    bob = await users_service.get_by_username(session, "bob")
    assert bob is not None
    r = await client.patch(
        f"/api/v1/users/{bob.id}/role",
        json={"role": "admin"},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    assert r.json()["role"] == "admin"

    # 不允许修改自己的角色 → 400
    r = await client.patch(
        f"/api/v1/users/{alice.id}/role",
        json={"role": "user"},
        headers=headers,
    )
    assert r.status_code == 400, r.text

    # 用户不存在 → 404
    r = await client.patch(
        "/api/v1/users/999999/role",
        json={"role": "user"},
        headers=headers,
    )
    assert r.status_code == 404, r.text
