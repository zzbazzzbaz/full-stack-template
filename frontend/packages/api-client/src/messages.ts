/**
 * 业务错误 code → 前端文案（模板为中文优先）。
 *
 * 后端 `DomainError.code` 是稳定标识（见 backend/app/services/errors.py 与
 * backend/app/api/error_handlers.py）；未知 code 时回落到后端 detail。
 * 新项目的业务 code 映射在此追加。
 */
export const ERROR_MESSAGES: Record<string, string> = {
  username_taken: "用户名已被占用",
  already_exists: "记录已存在，请勿重复提交",
  invalid_credentials: "用户名或密码错误",
  not_found: "资源不存在或已被删除",
  invalid_action: "当前操作不被允许",
  cannot_change_own_role: "不能修改自己的角色",
  internal_error: "服务器开小差了，请稍后重试",
};

/** 查 code 对应文案；未登记时返回 undefined（由调用方回落 detail）。 */
export function messageForCode(code: string | undefined): string | undefined {
  if (!code) {
    return undefined;
  }
  return ERROR_MESSAGES[code];
}
