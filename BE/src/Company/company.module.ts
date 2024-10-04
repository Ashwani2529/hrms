import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [CompanyController],
  providers: [PrismaService, CompanyService],
})
export class CompanyModule {}
