import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MatchEventsService } from '../services/match-events.service';
import {
  SubscribeToMatch,
  UnsubscribeFromMatch,
  SubscribeToMatchSchema,
  UnsubscribeFromMatchSchema,
  StartMatch,
  StartMatchSchema,
  MatchEventsSocketMessage,
} from '@repo/core';
import { WsValidationPipe } from '../../../shared/pipes/ws-validation.pipe';
import { WsExceptionFilter } from '../../../shared/filters/ws-exception.filter';

/**
 * WebSocket Gateway for real-time match events
 * Handles client connections, subscriptions, and broadcasts live match events
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'match-events',
  transports: ['websocket'],
})
@UseFilters(new WsExceptionFilter())
export class MatchEventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MatchEventsGateway.name);

  constructor(private readonly matchEventsService: MatchEventsService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.matchEventsService.setServer(server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    try {
      this.matchEventsService.handleClientDisconnect(client.id);
    } catch (error) {
      this.logger.error(`Error handling disconnect for ${client.id}:`, error);
    }
  }

  @SubscribeMessage(MatchEventsSocketMessage.SUBSCRIBE_TO_MATCH)
  async handleSubscribeToMatch(
    @MessageBody(new WsValidationPipe(SubscribeToMatchSchema))
    data: SubscribeToMatch,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.matchEventsService.subscribeToMatch(client.id, data.matchId);
      await client.join(`match:${data.matchId}`);
      return { success: true, message: `Subscribed to match ${data.matchId}` };
    } catch (error) {
      this.logger.error(
        `Error subscribing client ${client.id} to match ${data.matchId}:`,
        error,
      );
      throw new WsException('Failed to subscribe to match');
    }
  }

  @SubscribeMessage(MatchEventsSocketMessage.UNSUBSCRIBE_FROM_MATCH)
  async handleUnsubscribeFromMatch(
    @MessageBody(new WsValidationPipe(UnsubscribeFromMatchSchema))
    data: UnsubscribeFromMatch,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.matchEventsService.unsubscribeFromMatch(client.id, data.matchId);
      await client.leave(`match:${data.matchId}`);
      return {
        success: true,
        message: `Unsubscribed from match ${data.matchId}`,
      };
    } catch (error) {
      this.logger.error(
        `Error unsubscribing client ${client.id} from match ${data.matchId}:`,
        error,
      );
      throw new WsException('Failed to unsubscribe from match');
    }
  }

  @SubscribeMessage(MatchEventsSocketMessage.START_MATCH)
  handleStartMatch(
    @MessageBody(new WsValidationPipe(StartMatchSchema)) data: StartMatch,
  ) {
    try {
      if (this.matchEventsService.isMatchActive(data.matchId)) {
        throw new WsException(`Match ${data.matchId} is already in progress`);
      }

      this.matchEventsService.startMatchSimulation(data);

      return {
        success: true,
        message: `Match ${data.matchId} simulation started`,
      };
    } catch (error) {
      this.logger.error(
        `Error starting match ${data.matchId}:`,
        error instanceof Error ? error.message : error,
      );
      throw new WsException(
        error instanceof Error
          ? error.message
          : 'Failed to start match simulation',
      );
    }
  }
}
