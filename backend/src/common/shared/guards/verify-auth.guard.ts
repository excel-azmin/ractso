import { EnvConfigService } from '@/common/config/env/env-config.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithOTP } from '../interface/response';

@Injectable()
export class OTPVerifyAuthGuard implements CanActivate {
  private readonly logger = new Logger(OTPVerifyAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOTP>();

    const token = request.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException(
        'No token provided. Please include a token in the Authorization header.',
      );
    }

    try {
      // Secret is fetched from the environment variable
      const secret = this.configService.get('LOGIN_SECRET');

      // Verify the token
      const decoded = await this.jwtService.verifyAsync(token, { secret });

      // Attach the user info to the request for further processing
      request.user = decoded;
      this.logger.log(`User ${decoded.email} is authenticated.`);

      return true; // Return true when the token is valid
    } catch (error) {
      this.logger.error('Invalid token or token expired');
      throw new UnauthorizedException('Invalid token or token expired.');
    }
  }
}
