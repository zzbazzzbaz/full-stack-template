from pydantic import BaseModel


class Page[T](BaseModel):
    total: int
    items: list[T]
    offset: int
    limit: int


class ErrorBody(BaseModel):
    """统一错误响应体：detail 是开发者信息，code 是稳定标识（前端据此映射文案）。"""

    detail: str
    code: str
