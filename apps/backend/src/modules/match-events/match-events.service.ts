import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { BroadcastMatchEvent } from '@repo/core';

@Injectable()
export class MatchEventsService {
  private server: Server;
  private readonly logger = new Logger(MatchEventsService.name);

  private clientSubscriptions: Map<string, Set<number>> = new Map();

  setServer(server: Server) {
    this.server = server;
  }

  subscribeToMatch(clientId: string, matchId: number) {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(matchId);
    this.logger.log(`Client ${clientId} subscribed to match ${matchId}`);
  }

  unsubscribeFromMatch(clientId: string, matchId: number) {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.delete(matchId);
      this.logger.log(`Client ${clientId} unsubscribed from match ${matchId}`);
    }
  }

  handleClientDisconnect(clientId: string) {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      this.logger.log(
        `Cleaning up subscriptions for disconnected client ${clientId}`,
      );
      this.clientSubscriptions.delete(clientId);
    }
  }

  broadcastMatchEvent(matchId: number, event: BroadcastMatchEvent) {
    if (!this.server) {
      this.logger.error('Server not initialized');
      return;
    }

    const room = `match:${matchId}`;
    this.server.to(room).emit('matchEvent', event);
    this.logger.log(
      `Broadcasted ${event.event.type} event for match ${matchId}`,
    );
  }

  getSubscribedClients(matchId: number): string[] {
    const clients: string[] = [];
    for (const [
      clientId,
      subscriptions,
    ] of this.clientSubscriptions.entries()) {
      if (subscriptions.has(matchId)) {
        clients.push(clientId);
      }
    }
    return clients;
  }
}
