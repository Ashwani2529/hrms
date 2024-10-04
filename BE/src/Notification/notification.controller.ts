import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CreateNotification,
  DeleteNotification,
  SendNotification,
  UpdateNotification,
} from './dto/notification.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './gateway/notification.gateway';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('notification')
@ApiBearerAuth()
@ApiTags('Notification')
export class NotificationController {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR","EMP"])
  @Get(':notification_id')
  async getNotifications(
    @Req() req: Request,
    @Res() res: Response,
    @Param('notification_id') notification_id: string,
  ): Promise<Response> {
    const notifications = await this.notificationService.getOne(notification_id);
    return res.status(200).json(notifications);
  }

  @Roles(["ADMIN","HR"])
  @Get()
  async getAllNotifications(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const notifications = await this.notificationService.getAll();
    return res.status(200).json(notifications);
  }


  @Roles(["ADMIN","HR"])
  @Post()
  async createNotification(
    @Body() body: CreateNotification,
    @Req() req: Request | any,
    @Res() res: Response,
  ): Promise<Response> {
    const notification = await this.notificationService.create(body);
    await this.logs.LOG(req.user, 'Notification Created', LogType.Create, notification,
    `${req.user?.name} Created Notification with title ${body.title}, for users ${body.users}`
    );
    return res.status(201).json(notification);
  }

  @Roles(["ADMIN","HR"])
  @Put(':notification_id')
  async updateNotification(
    @Body() body: UpdateNotification,
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('notification_id') notification_id: string,
  ): Promise<Response> {
    const notification = await this.notificationService.update(notification_id, body);
    res.status(200).json(notification);
    await this.logs.LOG(req.user, 'Notification Updated', LogType.Update, notification,
    `${req.user?.name} Updated Notification with title ${body.title}, for users ${body.users}`
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async deleteNotification(
    @Body() body: DeleteNotification,
    @Req() req: Request | any,
    @Res() res: Response,
  ): Promise<Response> {
    await this.notificationService.delete(body);
    res.status(204).json();
    await this.logs.LOG(req.user, 'Notification Deleted', LogType.Delete, body,
    `${req.user?.name} Deleted Notifications with ids ${body.notifications}`
    );
    return;
  }

  @Post('notification_test')
  async sendNotification(
    @Body() body: SendNotification,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    await this.notificationGateway.handlesSendNotification(body);
    res.status(200).json();
    return;
  }
}
