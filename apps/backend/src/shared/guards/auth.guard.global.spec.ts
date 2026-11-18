import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@repo/core';
import { AuthGuard } from './auth.guard';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import { UserController } from '@/modules/users/controllers/user.controller';
import { UserService } from '@/modules/users/services/user.service';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { throttlerOptions } from '../../config/throttle.config';
import type { User } from '@/shared/entities/user.entity';

describe('Sessions over HTTP', () => {
  let app: INestApplication;
  const users: User[] = [1, 2].map((id) => ({
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    passwordHash: bcrypt.hashSync('Password123', 4),
    role: RoleType.USER,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const userService = {
    findById: (id: number) => users.find((u) => u.id === id) ?? null,
    findByEmail: (email: string) =>
      users.find((u) => u.email === email) ?? null,
    incrementTokenVersion: (id: number) => {
      users.find((u) => u.id === id)!.tokenVersion++;
    },
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1d' },
        }),
        ThrottlerModule.forRoot(throttlerOptions),
      ],
      controllers: [AppController, UserController, AuthController],
      providers: [
        AppService,
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        AuthGuard,
        { provide: APP_GUARD, useExisting: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(() => app.close());

  const server = () => app.getHttpServer();

  const login = async (email: string) => {
    const res = await request(server())
      .post('/auth/login')
      .send({ email, password: 'Password123' })
      .expect(200);
    const cookie = ([] as string[]).concat(res.headers['set-cookie'])[0];
    return { res, cookie: cookie.split(';')[0] };
  };

  it('keeps @Public() routes open', () =>
    request(server()).get('/').expect(200));

  it('rejects anonymous requests to user records', () =>
    request(server()).get('/users/1').expect(401));

  it('no longer serves email lookups or anonymous creation', async () => {
    const { cookie } = await login('user1@example.com');
    await request(server())
      .get('/users/email/user1@example.com')
      .set('Cookie', cookie)
      .expect(404);
    await request(server()).post('/users').set('Cookie', cookie).expect(404);
  });

  it('sets an httpOnly cookie that expires with the token, and keeps the token out of the body', async () => {
    const { res } = await login('user1@example.com');
    const cookie = ([] as string[]).concat(res.headers['set-cookie'])[0];

    expect(cookie).toMatch(/^auth_token=/);
    expect(cookie).toMatch(/HttpOnly/);
    const expires = new Date(/Expires=([^;]+)/.exec(cookie)![1]).getTime();
    expect(expires - Date.now()).toBeGreaterThan(23 * 3600_000);
    expect(expires - Date.now()).toBeLessThanOrEqual(24 * 3600_000);
    expect(res.body).toEqual({
      user: expect.objectContaining({ id: 1 }) as unknown,
    });
    expect(res.body).not.toHaveProperty('access_token');
  });

  it("returns your own record but not someone else's", async () => {
    const { cookie } = await login('user1@example.com');
    await request(server()).get('/users/1').set('Cookie', cookie).expect(200);
    await request(server()).get('/users/2').set('Cookie', cookie).expect(403);
  });

  it('logging out revokes the token, also when it is replayed as a bearer header', async () => {
    const { cookie } = await login('user2@example.com');
    const other = await login('user2@example.com');
    const token = cookie.slice('auth_token='.length);
    await request(server())
      .get('/auth/profile')
      .set('Cookie', cookie)
      .expect(200);

    await request(server())
      .post('/auth/logout')
      .set('Cookie', cookie)
      .expect(200);

    await request(server())
      .get('/auth/profile')
      .set('Cookie', cookie)
      .expect(401);
    await request(server())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    // Logout applies to every session of that user.
    await request(server())
      .get('/auth/profile')
      .set('Cookie', other.cookie)
      .expect(401);
    // A fresh login works again.
    const again = await login('user2@example.com');
    await request(server())
      .get('/auth/profile')
      .set('Cookie', again.cookie)
      .expect(200);
  });
});
