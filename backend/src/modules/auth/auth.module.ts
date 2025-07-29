import { ClerkModule } from '@/common/shared/ providers/clerk.module';
import { RedisCacheModule } from '@/common/shared/cache/redis-cache.module';
import { RequestEventEmitterModule } from '@/common/shared/event-emitter/event-emitter.module';
import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { authCommands, authHandlers } from './command';
import { AuthController } from './controller/auth.controller';
import { GetMeHandler } from './query/get-me.handler';
import { AuthService } from './service/auth.service';
import { ClerkStrategy } from './strategy/clerk.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.LOGIN_SECRET,
      signOptions: { expiresIn: process.env.LOGIN_EXPIRES_IN },
    }),
    forwardRef(() => RequestEventEmitterModule),
    CqrsModule,
    RedisCacheModule,
    ClerkModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ClerkStrategy,
    ...authCommands,
    ...authHandlers,

    GetMeHandler,
  ],
  exports: [AuthService],
})
export class AuthModule {}
