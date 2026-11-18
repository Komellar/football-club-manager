import { UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { RoleType } from '@repo/core';
import { MatchEventsGateway } from '../gateways/match-events.gateway';
import { MatchEventsService } from '../services/match-events.service';
import type { AuthService } from '../../auth/services/auth.service';

describe('MatchEventsGateway authentication', () => {
  const service = {
    subscribeToMatch: jest.fn(),
    getActiveMatch: jest.fn(),
    handleClientDisconnect: jest.fn(),
  };
  const auth = { verifySession: jest.fn() };
  let gateway: MatchEventsGateway;
  const makeClient = (id: string) => ({
    id,
    handshake: {
      auth: {},
      headers: { cookie: 'theme=dark; auth_token=token' },
    },
    join: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
  });
  let client: ReturnType<typeof makeClient>;

  const session = (userId: number) => ({
    user: { userId, name: 'User', email: 'u@example.com', role: RoleType.USER },
    expiresAt: new Date(Date.now() + 2000),
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    gateway = new MatchEventsGateway(
      service as unknown as MatchEventsService,
      auth as unknown as AuthService,
    );
    client = makeClient('client');
    auth.verifySession.mockImplementation(() => Promise.resolve(session(1)));
  });
  afterEach(() => {
    gateway.onModuleDestroy();
    jest.useRealTimers();
  });

  const subscribe = (socket = client) =>
    gateway.handleSubscribeToMatch({}, socket as unknown as Socket);

  it('verifies the session cookie from the handshake', async () => {
    await subscribe();
    expect(auth.verifySession).toHaveBeenCalledWith('token');
    expect(client.join).toHaveBeenCalledWith('active-match');
  });

  it('disconnects a subscribed socket when its token expires', async () => {
    await subscribe();
    jest.advanceTimersByTime(2000);
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('cancels the expiry timer when the client disconnects', async () => {
    await subscribe();
    gateway.handleDisconnect(client as unknown as Socket);
    jest.advanceTimersByTime(2000);
    expect(client.disconnect).not.toHaveBeenCalled();
  });

  it('rejects invalid or revoked sessions before joining the room', async () => {
    auth.verifySession.mockRejectedValue(
      new UnauthorizedException('Session has been revoked'),
    );
    await expect(subscribe()).rejects.toThrow(WsException);
    expect(client.join).not.toHaveBeenCalled();
  });

  it("drops only the logged-out user's sockets when sessions are revoked", async () => {
    const other = makeClient('other');
    await subscribe();
    auth.verifySession.mockResolvedValueOnce(session(2));
    await subscribe(other);

    gateway.onSessionsRevoked(1);

    expect(client.disconnect).toHaveBeenCalledWith(true);
    expect(other.disconnect).not.toHaveBeenCalled();
  });
});
