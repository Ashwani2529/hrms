import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [HolidayController],
  providers: [PrismaService, HolidayService],
})
export class HolidayModule {}
