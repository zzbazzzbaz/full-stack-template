from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """必填项唯一来源是 `.env`（缺 key 启动即报错 fail-fast）；带默认值的是代码内静态配置。"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str = Field(min_length=32)
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
    ]
    db_pool_size: int
    db_max_overflow: int
    db_pool_timeout: int
    db_pool_recycle: int

    @field_validator("jwt_secret")
    @classmethod
    def _reject_placeholder_secret(cls, value: str) -> str:
        if "change-me" in value:
            raise ValueError("JWT_SECRET 还是占位值，请换成随机密钥（openssl rand -hex 32）")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
