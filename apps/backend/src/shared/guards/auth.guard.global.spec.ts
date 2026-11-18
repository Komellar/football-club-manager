import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { RoleType } from '@repo/core';
import { AuthGuard } from './auth.guard';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import { UserController } from '@/modules/users/controllers/user.controller';
import { UserService } from '@/modules/users/services/user.service';

describe('Global AuthGuard over HTTP', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const user = {
    id: 1,
    name: 'Owner',
    email: 'owner@example.com',
    passwordHash: 'hash',
    role: RoleType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [AppController, UserController],
      providers: [
        AppService,
        { provide: UserService, useValue: { findById: () => user } },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        AuthGuard,
        { provide: APP_GUARD, useExisting: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(() => app.close());

  const tokenFor = (userId: number) =>
    jwt.sign({ userId, name: 'Owner', email: 'o@example.com', role: 'user' });

  it('keeps @Public() routes open', () =>
    request(app.getHttpServer()).get('/').expect(200));

  it('rejects anonymous requests to user records', () =>
    request(app.getHttpServer()).get('/users/1').expect(401));

  it('no longer serves email lookups or anonymous creation', async () => {
    const auth = { Authorization: `Bearer ${tokenFor(1)}` };
    await request(app.getHttpServer())
      .get('/users/email/owner@example.com')
      .set(auth)
      .expect(404);
    await request(app.getHttpServer()).post('/users').set(auth).expect(404);
  });

  it("returns your own record but not someone else's", async () => {
    await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${tokenFor(1)}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${tokenFor(2)}`)
      .expect(403);
  });
});
