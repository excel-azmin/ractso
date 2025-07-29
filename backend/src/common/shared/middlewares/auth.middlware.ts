import { JsonWebTokenService } from '@/common/lib/jwt-token/jsonwebtoken.service';
import { LoginTokenPayload } from '@/common/lib/jwt-token/types';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserStatus } from '../enum/user.enum';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jsonWebTokenService: JsonWebTokenService,
    private readonly prismaService: PrismaService,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  async use(req: any, _res: any, next: () => void) {
    // get authorization header
    const authorization = req.headers.authorization;

    // if no authorization header, set user to null
    if (!authorization) {
      req.user = null;
      return next();
    }

    // get token
    const token = authorization.split(' ')[1];
    if (!token?.trim()) {
      req.user = null;
      return next();
    }

    // verify token
    const userInfo =
      await this.jsonWebTokenService.verifyLoginToken<LoginTokenPayload>(
        token?.trim(),
      );
    if (!userInfo) throw new UnauthorizedException('Invalid or expired token.');

    // get user
    const user = await this.prismaService.user.findUnique({
      where: { id: userInfo.id },
    });
    if (!user) {
      req.user = null;
      return next();
    }

    // check if user is active
    if (user?.status !== UserStatus.ACTIVE)
      throw new UnauthorizedException('User is not active.');

    // set user to the request
    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles,
    };

    // check if token is blacklisted
    const isBlacklisted = await this.redisCacheService.getCacheValue(
      req.user.id,
      token,
    );
    if (isBlacklisted) {
      req.user = null;
      throw new UnauthorizedException('Token is revoked.');
    }

    // call the next function
    next();
  }
}
