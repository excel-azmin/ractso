import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvConfigModule } from './common/config/env/env-config.module';
import { LibModule } from './common/lib/lib.module';
import { RedisCacheModule } from './common/shared/cache/redis-cache.module';
import { AuthMiddleware } from './common/shared/middlewares/auth.middlware';
import { PrismaModule } from './common/shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    LibModule,
    AuthModule,
    EnvConfigModule,
    UserModule,
    PrismaModule,
    RedisCacheModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ClerkClientProvider,
    // {
    //   provide: APP_GUARD,
    //   useClass: ClerkAuthGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
