import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(
    err: Error | null,
    user: { id: string; role: string } | false,
    _info: string | null,
  ) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException('Refresh token tidak valid atau kadaluarsa')
      );
    }
    return user;
  }
}
