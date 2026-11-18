import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { MatchEventsGateway } from '../gateways/match-events.gateway';
import { MatchEventsService } from '../services/match-events.service';
import { AuthService } from '../../auth/services/auth.service';

describe('MatchEventsGateway handshake origin', () => {
  let app: INestApplication;
  let url: string;
  const previous = process.env.FRONTEND_URL;

  beforeAll(async () => {
    process.env.FRONTEND_URL = 'http://app.example.test';
    const moduleRef = await Test.createTestingModule({
      providers: [
        MatchEventsGateway,
        {
          provide: MatchEventsService,
          useValue: { handleClientDisconnect: () => undefined },
        },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.listen(0);
    url = `${await app.getUrl()}/match-events`.replace('[::1]', 'localhost');
  });

  afterAll(async () => {
    await app.close();
    process.env.FRONTEND_URL = previous;
  });

  const connect = (origin?: string) =>
    new Promise<'connected' | 'rejected'>((resolve) => {
      const socket: Socket = io(url, {
        transports: ['websocket'],
        reconnection: false,
        extraHeaders: origin ? { Origin: origin } : {},
      });
      socket.on('connect', () => {
        socket.close();
        resolve('connected');
      });
      socket.on('connect_error', () => {
        socket.close();
        resolve('rejected');
      });
    });

  it('accepts the configured frontend origin', async () => {
    await expect(connect('http://app.example.test')).resolves.toBe('connected');
  });

  it('refuses handshakes from other sites', async () => {
    await expect(connect('https://evil.example')).resolves.toBe('rejected');
  });

  it('allows non-browser clients without an Origin header', async () => {
    await expect(connect()).resolves.toBe('connected');
  });
});
