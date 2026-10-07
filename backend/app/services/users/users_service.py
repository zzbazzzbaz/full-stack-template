from sqlmodel import col, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import hash_password
from app.infrastructure.db.models.user import User
from app.services.errors import AlreadyExistsError, InvalidActionError, NotFoundError
from app.services.pagination import normalize


async def get_by_id(session: AsyncSession, user_id: int) -> User | None:
    return await session.get(User, user_id)


async def get_by_username(session: AsyncSession, username: str) -> User | None:
    return (await session.exec(select(User).where(User.username == username))).one_or_none()


async def register_user(session: AsyncSession, *, username: str, password: str) -> User:
    if await get_by_username(session, username) is not None:
        raise AlreadyExistsError(f"username {username!r} already taken")
    user = User(username=username, password_hash=hash_password(password))
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def list_users(session: AsyncSession, *, offset: int, limit: int) -> tuple[int, list[User]]:
    offset, limit = normalize(offset, limit)
    total = (await session.exec(select(func.count()).select_from(User))).one()
    items = (
        await session.exec(select(User).order_by(col(User.id)).offset(offset).limit(limit))
    ).all()
    return total, list(items)


async def set_role(session: AsyncSession, *, user: User, role: str) -> User:
    user.role = role
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def change_role(session: AsyncSession, *, user_id: int, role: str, actor: User) -> User:
    if user_id == actor.id:
        raise InvalidActionError("cannot change your own role")
    user = await get_by_id(session, user_id)
    if user is None:
        raise NotFoundError(f"user {user_id} not found")
    return await set_role(session, user=user, role=role)
