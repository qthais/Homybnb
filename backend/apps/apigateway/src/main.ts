import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcErrorInterceptor } from './utils/GrpcErrorInterceptor';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GrpcErrorInterceptor())
  app.setGlobalPrefix('api')
  const configService = app.get(ConfigService)
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:8080';
  const port = configService.get('PORT',3000);
  app.enableCors({
    origin: corsOrigin, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  })
  await app.listen(port);
}
bootstrap();
