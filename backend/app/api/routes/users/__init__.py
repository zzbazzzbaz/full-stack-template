from fastapi import APIRouter

from app.api.routes.users.users import router as users_routes

users_router = APIRouter()
users_router.include_router(users_routes, prefix="/users", tags=["users"])
