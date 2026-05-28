import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser = { id: string; role: string }>(
    err: Error | null,
    user: TUser | false,
    _info: string | null,
    _context: ExecutionContext,
    _status?: number,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Refresh token tidak valid atau kadaluarsa')
      );
    }
    return user;
  }
}
