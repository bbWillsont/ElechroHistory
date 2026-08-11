import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// TODO(security): после реализации модуля авторизации заменить на извлечение tenant_id из JWT.
// Сейчас читаем из заголовка x-tenant-id, чтобы не блокировать разработку.
export const TenantId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    return req.headers['x-tenant-id'] ?? req.query.tenantId;
  },
);
