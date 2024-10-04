import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { NotificationModule } from 'src/Notification/notification.module';
@Module({
  imports: [LoggerModule,NotificationModule],
  controllers: [TicketsController],
  providers: [PrismaService, TicketsService],
})
export class TicketsModule {}
