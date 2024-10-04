import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { LoggerModule } from 'src/Logger/logger.module';
import { NotificationModule } from 'src/Notification/notification.module';

@Module({
  imports: [LoggerModule,NotificationModule],
  controllers: [PayrollController],
  providers: [PrismaService, PayrollService],
})
export class PayrollModule {}
