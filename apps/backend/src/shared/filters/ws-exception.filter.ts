import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * Global exception filter for WebSocket connections
 * Catches all exceptions and sends them to the client in a consistent format
 */
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    this.logger.error('WebSocket exception:', exception);

    // Handle WsException
    if (exception instanceof WsException) {
      const error = exception.getError();
      client.emit('error', {
        status: 'error',
        message: typeof error === 'string' ? error : error,
      });
      return;
    }

    // Handle other exceptions
    client.emit('error', {
      status: 'error',
      message: 'Internal server error',
    });
  }
}
