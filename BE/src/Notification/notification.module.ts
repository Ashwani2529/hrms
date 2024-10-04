import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AuthModule } from 'src/Auth/auth.module';
import { NotificationGateway } from './gateway/notification.gateway';

@Module({
  imports: [forwardRef(()=>AuthModule), LoggerModule],
  controllers: [NotificationController],
  providers: [PrismaService, NotificationService ,NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
