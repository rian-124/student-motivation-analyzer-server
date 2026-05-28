import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private static readonly unauthenticatedMessage =
    'Anda harus login terlebih dahulu';

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = { id: string; role: string }>(
    err: Error | null,
    user: TUser | false,
    _info: string | null,
    _context: ExecutionContext,
    _status?: number,
  ): TUser {
    if (err || !user) {
      throw (
        err || new UnauthorizedException(JwtAuthGuard.unauthenticatedMessage)
      );
    }
    return user;
  }
}
