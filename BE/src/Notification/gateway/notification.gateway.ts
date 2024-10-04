import {
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseFilters, UseGuards} from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { WebSocketGuard } from 'src/Auth/guards/websocket.guard';
import { NotificationSeen, SendNotification } from '../dto/notification.dto';
import { WsCatchAllFilter } from 'src/Exceptions/ws/ws-catch-all-filter';

@Injectable()
@UseFilters(new WsCatchAllFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  allowEIO3: true,
})
export class NotificationGateway {
  constructor(private readonly notificationService: NotificationService) {}
  @WebSocketServer()
  server: Server;

  socketMap = new Map<string, Socket>();

  async handlesSendNotification(notification: SendNotification): Promise<void> {
    // console.log(this.socketMap)
    await this.notificationService.SendNotificationWS(notification, this.server , this.socketMap);
  }

  @UseGuards(WebSocketGuard)
  @SubscribeMessage('notification_seen')
  async handleNotificationSeen(
    @MessageBody() body: NotificationSeen,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    try {
      await this.notificationService.NotificationSeenWS(body, socket , this.server);
    } catch (error) {
      console.log(error);
      throw new WsException(error.message);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket): Promise<void> {
    try {
      await this.notificationService.handleConnectionWS(socket, this.server , this.socketMap);
    } catch (error) {
      socket.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket): Promise<void> {
    try {
      await this.notificationService.handleDisconnectWS(socket , this.socketMap);
    } catch (error) {
      socket.disconnect();
    }
  }
}
