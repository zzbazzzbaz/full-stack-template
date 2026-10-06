from collections.abc import AsyncIterator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Query, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import get_settings
from app.core.security import decode_subject
from app.infrastructure.db.models.user import User
from app.services.pagination import DEFAULT_LIMIT
from app.services.users import users_service

_bearer = HTTPBearer(auto_error=False)


async def get_session(request: Request) -> AsyncIterator[AsyncSession]:
    factory = request.app.state.session_factory
    async with factory() as session:
        yield session


async def get_current_user(
    session: AsyncSession = Depends(get_session),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> User:
    settings = get_settings()
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing token")
    try:
        subject = decode_subject(
            token=credentials.credentials,
            secret=settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.PyJWTError, ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token") from None
    try:
        user_id = int(subject)
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token") from None
    user = await users_service.get_by_id(session, user_id)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token")
    return user


def pagination_params(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=DEFAULT_LIMIT, ge=1),
) -> tuple[int, int]:
    return offset, limit


SessionDep = Annotated[AsyncSession, Depends(get_session)]
CurrentUser = Annotated[User, Depends(get_current_user)]
PageParams = Annotated[tuple[int, int], Depends(pagination_params)]
