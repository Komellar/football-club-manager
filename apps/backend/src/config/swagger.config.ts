import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Swagger/OpenAPI Documentation Configuration
 *
 * This configuration sets up comprehensive API documentation with:
 * - Interactive Swagger UI
 * - Auto-generated schemas from Zod validation
 * - JWT Bearer authentication support
 * - Organized endpoint tags and descriptions
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Football Club Manager API')
    .setDescription(
      'Comprehensive API for managing football club operations and user management.',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:4000', 'Development Server')
    .addTag('auth', 'Authentication and user registration endpoints')
    .addTag('users', 'User management and profile operations')
    .addTag(
      'players',
      'Player management, registration, and profile operations',
    )
    .addTag('contracts', 'Contract management and lifecycle operations')
    .addTag('transfers', 'Transfer management and player movement tracking')
    .addTag('statistics', 'Player performance statistics and analytics')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
