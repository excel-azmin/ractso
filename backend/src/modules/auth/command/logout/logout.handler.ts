import {
  EnvConfigService,
  LOGIN_EXPIRES_IN,
} from '@/common/config/env/env-config.service';
import { RedisCacheService } from '@/common/shared/cache/redis-cache.service';
import { PrismaService } from '@/common/shared/prisma/prisma.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: EnvConfigService,
  ) {}
  async execute(command: LogoutCommand): Promise<any> {
    const { userId, request } = command;

    const authHeader = request.headers['authorization'];
    const access_token = authHeader.split(' ')[1];
    await this.redisCacheService.setCache(
      userId,
      access_token,
      parseInt(this.configService.get(LOGIN_EXPIRES_IN)),
    );

    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return {
      data: {
        message: 'User logged out successfully',
      },
    };
  }
}
