import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GrpcErrorInterceptor } from './utils/GrpcErrorInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GrpcErrorInterceptor())
  app.enableCors({
    origin: 'http://localhost:8080', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
