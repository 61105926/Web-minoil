import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) {
      const req = context.switchToHttp().getRequest();
      const path = String(req.originalUrl || req.url || '').split('?')[0].replace(/[\r\n]/g, '');
      const reason = String(err?.message || info?.message || 'Token no válido').replace(/[\r\n]/g, ' ');
      console.warn(`[AUTH] ${req.method} ${path}: ${reason}`);
    }
    return super.handleRequest<TUser>(err, user, info, context, status);
  }
}
