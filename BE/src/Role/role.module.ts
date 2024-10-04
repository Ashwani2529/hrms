import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { LoggerModule } from 'src/Logger/logger.module';

@Module({
  imports: [LoggerModule],
  controllers: [RoleController],
  providers: [PrismaService, RoleService],
})
export class RoleModule {}
