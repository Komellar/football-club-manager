import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { apiDocsEnabled, setupSwagger } from './config/swagger.config';
import { setupUploads } from './config/uploads.config';
import { allowedOrigins } from './config/origins.config';
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

  // Behind a reverse proxy, set TRUST_PROXY (e.g. 1) so rate limits see the
  // client's IP instead of the proxy's.
  if (process.env.TRUST_PROXY) {
    const hops = Number(process.env.TRUST_PROXY);
    app.set('trust proxy', Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
  }

  // The web app on another port of the same site loads API images.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.enableCors({
    origin: allowedOrigins(),
    credentials: true,
  });

  app.use(cookieParser());

  setupUploads(app);

  if (apiDocsEnabled()) {
    setupSwagger(app);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

void bootstrap();
