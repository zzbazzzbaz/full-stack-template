from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import Settings
from app.core.security import create_access_token, verify_password
from app.services.errors import InvalidCredentialsError
from app.services.users import users_service


async def login(session: AsyncSession, *, username: str, password: str, settings: Settings) -> str:
    user = await users_service.get_by_username(session, username)
    if user is None or user.id is None:
        raise InvalidCredentialsError("invalid username or password")
    if not verify_password(password, user.password_hash):
        raise InvalidCredentialsError("invalid username or password")
    return create_access_token(
        subject=str(user.id),
        secret=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        expires_minutes=settings.access_token_expire_minutes,
    )
