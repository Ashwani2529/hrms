import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { PrismaService } from 'src/prisma.service';
import { LoggerController } from './logger.controller';

@Module({
  providers: [LoggerService, PrismaService],
  controllers: [LoggerController],
  exports: [LoggerService],
})
export class LoggerModule {}
