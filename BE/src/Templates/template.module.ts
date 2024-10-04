import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Module({
  imports: [LoggerModule],
  controllers: [TemplateController],
  providers: [PrismaService, TemplateService],
})
export class TemplateModule {}
