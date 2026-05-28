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

  handleRequest(
    err: Error | null,
    user: { id: string; role: string } | false,
    _info: string | null,
  ) {
    if (err || !user) {
      throw (
        err || new UnauthorizedException(JwtAuthGuard.unauthenticatedMessage)
      );
    }
    return user;
  }
}
