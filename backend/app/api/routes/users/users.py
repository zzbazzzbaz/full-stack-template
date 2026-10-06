from fastapi import APIRouter

from app.api.dependencies import CurrentUser, PageParams, SessionDep
from app.api.schemas.auth import UserResponse
from app.api.schemas.common import Page
from app.services.pagination import normalize
from app.services.users import users_service

router = APIRouter()


@router.get("", response_model=Page[UserResponse])
async def list_all_users(
    session: SessionDep,
    _me: CurrentUser,
    page: PageParams,
) -> Page[UserResponse]:
    offset, limit = normalize(*page)
    total, items = await users_service.list_users(session, offset=offset, limit=limit)
    return Page[UserResponse](
        total=total,
        items=[UserResponse.model_validate(u) for u in items],
        offset=offset,
        limit=limit,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(me: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(me)
