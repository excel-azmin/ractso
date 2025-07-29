import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/shared/interceptors/response.interceptors';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(clerkMiddleware());
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Backbone API Gateway')
    .setDescription(
      'A comprehensive API Gateway for the Nestjs backend with microservices architecture',
    )
    .setVersion('1.0')
    .addTag('API Gateway')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Enter JWT token in this format - Bearer YOUR_TOKEN to access protected routes only.',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  // global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.startAllMicroservices();
  await app.listen(3001);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
