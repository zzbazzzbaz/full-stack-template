from fastapi import APIRouter

from app.api.routes.auth.auth import router as auth_routes

auth_router = APIRouter()
auth_router.include_router(auth_routes, prefix="/auth", tags=["auth"])
