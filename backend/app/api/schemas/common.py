from pydantic import BaseModel


class Page[T](BaseModel):
    total: int
    items: list[T]
    offset: int
    limit: int


class ErrorBody(BaseModel):
    detail: str
