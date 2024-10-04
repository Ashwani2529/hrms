import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { RemarkController } from './remark.controller';
import { RemarkService } from './remark.service';
@Module({
  imports: [LoggerModule],
  controllers: [RemarkController],
  providers: [PrismaService, RemarkService],
})
export class RemarkModule {}
