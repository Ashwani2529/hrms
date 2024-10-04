import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [],
  controllers: [AnalyticsController],
  providers: [PrismaService, AnalyticsService],
})
export class AnalyticsModule {}
