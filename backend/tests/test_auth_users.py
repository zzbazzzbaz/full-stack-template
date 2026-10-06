async def test_register_login_list_users(client):
    # 注册
    r = await client.post(
        "/api/v1/auth/register",
        json={"username": "alice", "password": "secret123"},
    )
    assert r.status_code == 201, r.text
    assert r.json()["username"] == "alice"
    assert "password_hash" not in r.json()

    # 重复注册 → 409
    r = await client.post(
        "/api/v1/auth/register",
        json={"username": "alice", "password": "secret123"},
    )
    assert r.status_code == 409, r.text

    # 登录失败 → 401
    r = await client.post(
        "/api/v1/auth/login",
        json={"username": "alice", "password": "wrongpass"},
    )
    assert r.status_code == 401, r.text

    # 登录成功
    r = await client.post(
        "/api/v1/auth/login",
        json={"username": "alice", "password": "secret123"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 未带 token 查用户 → 401
    r = await client.get("/api/v1/users")
    assert r.status_code == 401, r.text

    # 带 token 查用户
    r = await client.get("/api/v1/users", headers=headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["total"] == 1
    assert body["items"][0]["username"] == "alice"

    # /me
    r = await client.get("/api/v1/users/me", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["username"] == "alice"

    # 再注册一个，验证分页 total
    r = await client.post(
        "/api/v1/auth/register",
        json={"username": "bob", "password": "secret123"},
    )
    assert r.status_code == 201, r.text
    r = await client.get("/api/v1/users?offset=0&limit=1", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["total"] == 2
    assert len(r.json()["items"]) == 1
