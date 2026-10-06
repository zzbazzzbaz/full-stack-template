from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import SessionDep
from app.api.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.core.config import get_settings
from app.services.auth import auth_service
from app.services.errors import AlreadyExistsError, InvalidCredentialsError
from app.services.users import users_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, session: SessionDep) -> UserResponse:
    try:
        user = await users_service.register_user(
            session, username=body.username, password=body.password
        )
    except AlreadyExistsError as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: SessionDep) -> TokenResponse:
    try:
        token = await auth_service.login(
            session,
            username=body.username,
            password=body.password,
            settings=get_settings(),
        )
    except InvalidCredentialsError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(e)) from e
    return TokenResponse(access_token=token)
