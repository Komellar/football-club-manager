import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { RoleType } from '@repo/core';
import { MatchEventsGateway } from '../gateways/match-events.gateway';
import { MatchEventsService } from '../services/match-events.service';

describe('MatchEventsGateway authentication', () => {
  const service = {
    subscribeToMatch: jest.fn(),
    getActiveMatch: jest.fn(),
    handleClientDisconnect: jest.fn(),
  };
  const jwt = { verifyAsync: jest.fn() };
  const config = { get: jest.fn(() => 'test-secret') };
  let gateway: MatchEventsGateway;
  const client = {
    id: 'client',
    handshake: { auth: { token: 'token' }, headers: {} },
    join: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    gateway = new MatchEventsGateway(
      service as unknown as MatchEventsService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
    jwt.verifyAsync.mockResolvedValue({
      userId: 1,
      name: 'User',
      email: 'user@example.com',
      role: RoleType.USER,
      exp: Math.floor(Date.now() / 1000) + 2,
    });
    client.join.mockResolvedValue(undefined);
  });
  afterEach(() => {
    gateway.onModuleDestroy();
    jest.useRealTimers();
  });

  it('disconnects a subscribed socket when its token expires', async () => {
    await gateway.handleSubscribeToMatch({}, client as unknown as Socket);
    expect(client.join).toHaveBeenCalledWith('active-match');
    jest.advanceTimersByTime(2000);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('cancels the expiry timer when the client disconnects', async () => {
    await gateway.handleSubscribeToMatch({}, client as unknown as Socket);
    gateway.handleDisconnect(client as unknown as Socket);
    jest.advanceTimersByTime(2000);
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('rejects a signed payload without a user identity before joining the room', async () => {
    jwt.verifyAsync.mockResolvedValue({ role: RoleType.ADMIN });
    await expect(
      gateway.handleSubscribeToMatch({}, client as unknown as Socket),
    ).rejects.toThrow(WsException);
    expect(client.join).not.toHaveBeenCalled();
  });
});
