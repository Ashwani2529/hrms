import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { PrismaService } from 'src/prisma.service';
import { AttendanceService } from 'src/Attendance/attendance.service';

@Module({
  providers: [AttendanceService, PrismaService, TasksService],
})
export class TasksModule {}
