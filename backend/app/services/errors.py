"""跨模块共享的业务异常。

HTTP 状态码映射由 api 层负责。
"""


class DomainError(Exception):
    """业务异常基类，api 层可统一捕获转 500 兜底。"""


class AlreadyExistsError(DomainError):
    """资源已存在，如用户名被占用。"""


class InvalidCredentialsError(DomainError):
    """登录凭证无效（用户名不存在或密码错误，不区分原因防枚举）。"""


class NotFoundError(DomainError):
    """资源不存在。"""


class InvalidActionError(DomainError):
    """当前状态下不允许的操作，如修改自己的角色。"""
