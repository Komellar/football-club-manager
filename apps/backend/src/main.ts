import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedRoles } from './database/seeders/role.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  const dataSource = app.get(DataSource);
  await seedRoles(dataSource);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

void bootstrap();
