import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { setupSwagger } from './config/swagger.config';
import * as qs from 'qs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure Express to properly parse nested query parameters
  app.set('query parser', (str: string) => {
    return qs.parse(str, {
      allowDots: false,
      depth: 5,
      arrayLimit: 50,
      parseArrays: true,
      allowPrototypes: false,
      plainObjects: true,
    });
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });

  app.use(cookieParser());

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  setupSwagger(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

void bootstrap();
