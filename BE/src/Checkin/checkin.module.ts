import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [CheckinController],
  providers: [PrismaService, CheckinService],
})
export class CheckinModule {}
