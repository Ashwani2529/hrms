import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LoggerModule } from 'src/Logger/logger.module';
import { NotificationModule } from 'src/Notification/notification.module';
@Module({
  imports: [LoggerModule , NotificationModule],
  controllers: [LeaveController],
  providers: [PrismaService, LeaveService],
})
export class LeaveModule {}
