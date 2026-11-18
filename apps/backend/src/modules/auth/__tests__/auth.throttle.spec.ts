import { Test } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { throttlerOptions } from '../../../config/throttle.config';

describe('Login and registration rate limits', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(throttlerOptions)],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: () => {
              throw new UnauthorizedException('Invalid credentials');
            },
            register: () => ({
              token: 't',
              expiresAt: new Date(Date.now() + 60_000),
              body: { user: {} },
            }),
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  const login = (email: string) =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Wrong-pass1' });

  it('blocks an IP after 10 login attempts in a minute', async () => {
    for (let i = 0; i < 10; i++)
      await login(`user${i}@example.com`).expect(401);
    const blocked = await login('another@example.com').expect(429);
    expect(blocked.body.message).toMatch(/too many attempts/i);
  });

  it('limits sign-ups to 5 per hour per IP', async () => {
    const signUp = (i: number) =>
      request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'New User',
          email: `new${i}@example.com`,
          password: 'Str0ngPass',
        });
    for (let i = 0; i < 5; i++) await signUp(i).expect(201);
    await signUp(5).expect(429);
  });
});
