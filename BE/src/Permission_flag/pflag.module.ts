import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PflagService } from './pflag.service';
import { PflagController } from './pflag.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [PflagController],
  providers: [PrismaService, PflagService],
})
export class PflagModule {}
