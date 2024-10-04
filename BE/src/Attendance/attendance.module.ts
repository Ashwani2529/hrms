import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [AttendanceController],
  providers: [PrismaService, AttendanceService],
})
export class AttendanceModule {}
