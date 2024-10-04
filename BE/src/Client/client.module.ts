import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [ClientController],
  providers: [PrismaService, ClientService],
})
export class ClientModule {}
