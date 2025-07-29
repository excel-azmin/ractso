import {
  EnvConfigService,
  REFRESH_EXPIRES_IN,
} from '@/common/config/env/env-config.service';
import { BcryptService } from '@/common/lib/bcrypt/bcypt.service';
import { JsonWebTokenService } from '@/common/lib/jwt-token/jsonwebtoken.service';
import { RedisCacheService } from '@/common/shared/cache/redis-cache.service';
import { CustomError } from '@/common/shared/errors/custom-error';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JsonWebTokenService,
    private readonly bcryptService: BcryptService,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: EnvConfigService,
  ) {}
  async execute(command: RefreshTokenCommand): Promise<any> {
    const { refreshTokenDto } = command;
    const { refreshToken } = refreshTokenDto;

    const userEmail =
      await this.jwtService.extractRefreshTokenEmail(refreshToken);
    if (!userEmail) {
      throw new Error('Invalid refresh token');
    }

    // Check if the refresh token is blacklisted
    const isBlacklisted = await this.redisCacheService.getCacheValue(
      userEmail,
      refreshToken,
    );
    if (isBlacklisted) {
      throw new CustomError(
        'Refresh token is revoked',
        400,
        'BlacklistedRefreshToken',
      );
    }

    const user = await this.prismaService.user.findUnique({
      where: { email: userEmail },
      select: { hashedRefreshToken: true, id: true, email: true },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const isRefreshTokenValid = await this.bcryptService.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new CustomError(
        'Refresh token invalid or expired',
        400,
        'InvalidRefreshToken',
      );
    }
    const isValid = await this.jwtService.verifyRefreshToken(refreshToken);
    if (!isValid) {
      throw new Error('Refresh token invalid');
    }
    const access_token = await this.jwtService.loginToken({
      id: user.id,
    });
    const newRefreshToken = await this.jwtService.generateRefreshToken(
      user.email,
    );

    const hashedRefreshToken = await this.bcryptService.hash(newRefreshToken);
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    await this.redisCacheService.setCache(
      user.email,
      refreshToken,
      parseInt(this.configService.get(REFRESH_EXPIRES_IN)),
    );

    return {
      access_token,
      refresh_token: newRefreshToken,
    };
  }
}
