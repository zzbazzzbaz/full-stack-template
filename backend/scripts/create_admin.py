"""创建或提升管理员账号。

用法：
    uv run python -m scripts.create_admin <username> [password]

用户已存在时直接提升为 admin；不存在时用给定密码注册（必须提供）。
"""

import asyncio
import sys

from app.core.config import get_settings
from app.infrastructure.db.engine import create_engine
from app.infrastructure.db.session import create_session_factory
from app.services.users import users_service


async def main() -> int:
    if len(sys.argv) not in (2, 3):
        print("用法：uv run python -m scripts.create_admin <username> [password]")
        return 2

    username = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) == 3 else None

    settings = get_settings()
    engine = create_engine(
        settings.database_url,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )
    try:
        factory = create_session_factory(engine)
        async with factory() as session:
            user = await users_service.get_by_username(session, username)
            if user is None:
                if password is None:
                    print(f"用户 {username!r} 不存在，创建需要提供密码")
                    return 1
                user = await users_service.register_user(
                    session, username=username, password=password
                )
            await users_service.set_role(session, user=user, role="admin")
            print(f"已把 {username!r} 设为 admin")
            return 0
    finally:
        await engine.dispose()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
