import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedRoles } from './database/seeders/role.seeder';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.use(cookieParser());

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const dataSource = app.get(DataSource);
  await seedRoles(dataSource);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

void bootstrap();
