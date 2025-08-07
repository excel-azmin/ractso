import { JsonWebTokenService } from '@/common/lib/jwt-token/jsonwebtoken.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from '../interface/response';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JsonWebTokenService) {}

  private readonly logger = new Logger(RefreshAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const refreshToken = request.body['refreshToken'];
    console.log('Received refresh token:', refreshToken); // Debugging line

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token is missing. Please provide a valid refresh token.',
      );
    }

    const isValid = this.jwtService.verifyRefreshToken(refreshToken);
    console.log('Is refresh token valid?', isValid); // Debugging line

    if (!isValid) {
      throw new UnauthorizedException(
        'Invalid refresh token. Please login again.',
      );
    }

    return true;
  }
}
