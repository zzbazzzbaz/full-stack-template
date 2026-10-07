from fastapi import APIRouter, status

from app.api.dependencies import SessionDep
from app.api.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.api.schemas.users import UserResponse
from app.core.config import get_settings
from app.services.auth import auth_service
from app.services.users import users_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, session: SessionDep) -> UserResponse:
    user = await users_service.register_user(
        session, username=body.username, password=body.password
    )
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    token = await auth_service.login(
        session,
        username=body.username,
        password=body.password,
        settings=get_settings(),
    )
    return TokenResponse(access_token=token)
