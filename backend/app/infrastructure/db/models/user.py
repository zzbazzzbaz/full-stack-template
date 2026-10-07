from sqlmodel import Field

from app.infrastructure.db.base import TimestampMixin


class User(TimestampMixin, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=32)
    password_hash: str = Field(nullable=False)
    role: str = Field(default="user", max_length=16)
