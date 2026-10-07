"""用户域接口。

- `/me`：任何登录用户
- 列表 / 改角色：仅管理员——身份差异体现在依赖（CurrentAdminDep）上，
  不拆目录、不拆 URL、不拆 tag。
"""

from fastapi import APIRouter

from app.api.dependencies import (
    CurrentAdminDep,
    CurrentUserDep,
    PageParamsDep,
    SessionDep,
)
from app.api.schemas.common import Page
from app.api.schemas.users import RoleUpdateRequest, UserResponse
from app.services.pagination import normalize
from app.services.users import users_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(me: CurrentUserDep) -> UserResponse:
    return UserResponse.model_validate(me)


@router.get("", response_model=Page[UserResponse])
async def list_all_users(
    session: SessionDep,
    page: PageParamsDep,
    _admin: CurrentAdminDep,
) -> Page[UserResponse]:
    offset, limit = normalize(*page)
    total, items = await users_service.list_users(session, offset=offset, limit=limit)
    return Page[UserResponse](
        total=total,
        items=[UserResponse.model_validate(u) for u in items],
        offset=offset,
        limit=limit,
    )


@router.patch("/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: int,
    body: RoleUpdateRequest,
    session: SessionDep,
    me: CurrentAdminDep,
) -> UserResponse:
    user = await users_service.change_role(session, user_id=user_id, role=body.role, actor=me)
    return UserResponse.model_validate(user)
