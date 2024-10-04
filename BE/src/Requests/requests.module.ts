import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { RequestService } from './requests.service';
import { RequestsController } from './requests.controller';
import { NotificationModule } from 'src/Notification/notification.module';
@Module({
  imports: [LoggerModule,NotificationModule],
  controllers: [RequestsController],
  providers: [PrismaService, RequestService],
})
export class RequestsModule {}
