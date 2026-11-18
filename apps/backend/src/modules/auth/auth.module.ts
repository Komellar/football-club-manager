import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { UserModule } from '@/modules/users/user.module';

/** Sessions last one day unless JWT_EXPIRES_IN says otherwise. */
export const DEFAULT_SESSION_LIFETIME = '1d';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET must be set');
        }
        return {
          secret,
          signOptions: {
            expiresIn:
              configService.get<string>('JWT_EXPIRES_IN') ||
              DEFAULT_SESSION_LIFETIME,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    { provide: APP_GUARD, useExisting: AuthGuard },
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
