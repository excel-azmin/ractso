import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './common/config/env/env-config.module';
import { LibModule } from './common/lib/lib.module';
import { RedisCacheModule } from './common/shared/cache/redis-cache.module';
import { AuthGuard } from './common/shared/guards/login-auth.guard';
import { AuthMiddleware } from './common/shared/middlewares/auth.middlware';
import { PrismaModule } from './common/shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostModule } from './modules/post/post.module';
import { UserModule } from './modules/user/user.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    LibModule,
    AuthModule,
    EnvConfigModule,
    UserModule,
    PrismaModule,
    RedisCacheModule,
    PostModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
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
