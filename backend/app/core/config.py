from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """所有字段必填，无默认值，唯一来源是 .env（缺 key 启动即报错 fail-fast）。"""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str
    database_url: str
    jwt_secret: str
    jwt_algorithm: str
    access_token_expire_minutes: int
    db_pool_size: int
    db_max_overflow: int
    db_pool_timeout: int
    db_pool_recycle: int


@lru_cache
def get_settings() -> Settings:
    return Settings()
