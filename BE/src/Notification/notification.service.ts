import { PrismaService } from 'src/prisma.service';
import { Notification, User, Permission_flag } from '@prisma/client';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  CreateNotification,
  DeleteNotification,
  NotificationSeen,
  SendNotification,
  UpdateNotification,
} from './dto/notification.dto';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NotificationService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async handleConnectionWS(socket: Socket, server: Server , socketMap : Map<string, Socket>): Promise<void> {
    const { userId } = await this.jwtService.verify(socket.handshake.headers.authorization.split(' ')[1]);
    socketMap.set(userId, socket);
    await this.handleHistoryNotificationWS(userId ,socket.id, server);
  }

  async handleDisconnectWS(socket: Socket , socketMap : Map<string, Socket>): Promise<void> {
    const { userId }= await this.jwtService.verify(socket.handshake.headers.authorization.split(' ')[1]);
    socketMap.delete(userId);
    socket.disconnect();
  }

  async NotificationSeenWS(data: NotificationSeen, socket: Socket , server : Server): Promise<void> {
    const update_notification =  await this.prisma.handlePrismaError(this.prisma.notification.update({
      where: {
        notification_id: data.notifications
      },
      data: {
        notification_status: 'Read',
      },
  }));
    server.to(socket.id).emit('notification_seen', "Sucess");
  }

  async SendNotificationWS(
    data: SendNotification,
    server: Server,
    socketMap : Map<string, Socket>
  ): Promise<void> {

    let recievers:{user_id:string}[] | null = null;

    if(data?.userId){
      recievers = data?.userId?.map((e)=>{
        return {user_id:e}
      })
    }
    else{
      recievers = await this.prisma.user.findMany({
        where: {
          role: {
            role_permission : {
              some : {
                  permission_flag : {
                    permission_flag_name : {
                      in : data.roles
                  }
                }
              }
            }
          },
        },
        select: {
          user_id: true,
        },
      });
    }
    
  
    await this.prisma.handlePrismaError(this.prisma.notification.createMany({
      data: recievers.map(user => ({
        title: data.title,
        description: data.description,
        notification_type: data.notification_type,
        notification_status: data.notification_status,
        user_id: user.user_id,
      })),
    }));
    
    recievers.forEach(async user => {
      const userSocket = socketMap.get(user.user_id);
      if (userSocket) {
        server.to(userSocket.id).emit('notification_live', data);
      }
    });

  }

  async handleHistoryNotificationWS(userId : string ,socketId : string, server: Server): Promise<void> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    server.to(socketId).emit('notification_history', notifications);
  }
  
  async findUserFromID(server: Server, user_ids: string[]): Promise<string[]> {
    const sockets = await server.fetchSockets();
    const userSocketIds: string[] = [];
    sockets.forEach(socket => {
      if (user_ids.includes(socket.handshake.query.userId as string)) {
        userSocketIds.push(socket.id);
      }
    });
    return userSocketIds;
  }

  async getOne(notification_id : string): Promise<Notification> {
    return await this.prisma.notification.findUniqueOrThrow({
        where: {
          notification_id: notification_id,
        },
      },
    );
  }

  async getAll(): Promise<Notification[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return notifications;
  }

  async create(data: CreateNotification): Promise<any> {
    return  await this.prisma.handlePrismaError(this.prisma.notification.createMany({
      data: data.users.map(user_id => ({
        title: data.title,
        description: data.description,
        notification_type: data.notification_type,
        notification_status: data.notification_status,
        user_id: user_id,
      })),
    }));
  }

  async update(id: string, data: UpdateNotification): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: {
        notification_id: id,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return  await this.prisma.handlePrismaError(this.prisma.notification.update({
      where: {
        notification_id: id,
      },
      data: {
        ...data,
      },
    }));
  }

  async delete(data: DeleteNotification): Promise<any> {
    const notifications =  await this.prisma.handlePrismaError(this.prisma.notification.deleteMany({
      where: {
        notification_id: {
          in: data.notifications,
        },
      },
    }));

    if (notifications.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return {
      message: 'Notifications deleted successfully',
      deletedNotifications: data.notifications,
    };
  }
}
