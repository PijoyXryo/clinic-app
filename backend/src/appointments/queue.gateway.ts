import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { Appointment } from './appointment.entity.js';

// Same trusted origins as our REST API's CORS
@WebSocketGateway({
  cors: { origin: ['http://localhost:3001', 'http://127.0.0.1:3001'] },
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QueueGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Screen connected: ${client.id} (${this.server.engine.clientsCount} online)`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Screen disconnected: ${client.id}`);
  }

  // Push the latest queue to EVERY connected screen
  broadcastQueue(queue: Appointment[]) {
    this.server.emit('queue:updated', queue);
  }
}