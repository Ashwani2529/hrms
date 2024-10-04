import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { HolidayModule } from 'src/Holiday/holiday.module';
import { HolidayService } from 'src/Holiday/holiday.service';

@Module({
  imports: [LoggerModule, HolidayModule],
  controllers: [ShiftController],
  providers: [PrismaService, ShiftService, HolidayService],
})
export class ShiftModule {}
