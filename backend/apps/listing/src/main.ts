import { NestFactory } from '@nestjs/core';
import { ListingModule } from './listing.module';

async function bootstrap() {
  const app = await NestFactory.create(ListingModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
