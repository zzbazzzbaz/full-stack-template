"""跨模块共享的业务异常。

HTTP 状态码映射由 api 层负责；`code` 是稳定错误标识（前端据此映射文案），
默认取类属性，具体场景可在抛出时覆盖。
"""


class DomainError(Exception):
    """业务异常基类，api 层统一捕获转 HTTP。"""

    code = "domain_error"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        if code is not None:
            self.code = code


class AlreadyExistsError(DomainError):
    """资源已存在，如用户名被占用。"""

    code = "already_exists"


class InvalidCredentialsError(DomainError):
    """登录凭证无效（用户名不存在或密码错误，不区分原因防枚举）。"""

    code = "invalid_credentials"


class NotFoundError(DomainError):
    """资源不存在。"""

    code = "not_found"


class InvalidActionError(DomainError):
    """当前状态下不允许的操作，如修改自己的角色。"""

    code = "invalid_action"
