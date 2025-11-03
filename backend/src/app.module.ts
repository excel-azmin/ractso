import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './common/config/env/env-config.module';
import { getBullConfig } from './common/config/queue/queue.config';
import { HealthModule } from './common/health/health.module';
import { LibModule } from './common/lib/lib.module';
import { RedisCacheModule } from './common/shared/cache/redis-cache.module';
import { AuthGuard } from './common/shared/guards/login-auth.guard';
import { AuthMiddleware } from './common/shared/middlewares/auth.middlware';
import { PrismaModule } from './common/shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    LibModule,
    AuthModule,
    EnvConfigModule,
    UserModule,
    PrismaModule,
    RedisCacheModule,
    HealthModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60000), // 60 seconds
          limit: config.get('THROTTLE_LIMIT', 1000000), // 100 requests per TTL
        },
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getBullConfig,
      inject: [ConfigService],
    }),
    PostModule,
    PaymentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // ClerkClientProvider,
    // {
    //   provide: APP_GUARD,
    //   useClass: ClerkAuthGuard,
    // },
  ],
  exports: [AuthGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
