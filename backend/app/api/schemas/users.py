from datetime import datetime
from typing import Literal

from pydantic import BaseModel

UserRole = Literal["user", "admin"]


class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class RoleUpdateRequest(BaseModel):
    role: UserRole
