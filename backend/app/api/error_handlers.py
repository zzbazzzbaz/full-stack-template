"""DomainError → HTTP 响应的统一映射。

业务异常由 services 抛出（见 app/services/errors.py），
状态码与响应体形状在这里统一处理：route / service 直接抛出即可，不必 try/except。
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.api.schemas.common import ErrorBody
from app.services.errors import (
    AlreadyExistsError,
    DomainError,
    InvalidActionError,
    InvalidCredentialsError,
    NotFoundError,
)

logger = logging.getLogger(__name__)

# 只登记 DomainError 子类；按 MRO 查找，未登记的子类走 500 兜底
_STATUS_BY_ERROR: dict[type, int] = {
    InvalidCredentialsError: status.HTTP_401_UNAUTHORIZED,
    InvalidActionError: status.HTTP_400_BAD_REQUEST,
    NotFoundError: status.HTTP_404_NOT_FOUND,
    AlreadyExistsError: status.HTTP_409_CONFLICT,
}

_INTERNAL_ERROR_DETAIL = "internal server error"


def _status_code(exc: Exception) -> int | None:
    for cls in type(exc).__mro__:
        if cls in _STATUS_BY_ERROR:
            return _STATUS_BY_ERROR[cls]
    return None


async def _handle_domain_error(request: Request, exc: Exception) -> JSONResponse:
    status_code = _status_code(exc)
    if status_code is None:
        # 未登记的业务异常：记日志，响应不泄露内部信息
        logger.error(
            "unmapped domain error on %s %s",
            request.method,
            request.url.path,
            exc_info=exc,
        )
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        detail = _INTERNAL_ERROR_DETAIL
    else:
        detail = str(exc)
    return JSONResponse(status_code=status_code, content=ErrorBody(detail=detail).model_dump())


def register_error_handlers(app: FastAPI) -> None:
    """注册 DomainError 全局处理；create_app 与测试 app 都要调用。"""
    app.add_exception_handler(DomainError, _handle_domain_error)
