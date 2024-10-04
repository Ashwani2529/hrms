import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/Auth/auth.module';
import { UserService } from './user.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { DocService } from 'src/User_Doc/doc.service';
import { NotificationModule } from 'src/Notification/notification.module';
import { TemplateService } from 'src/Templates/template.service';

@Module({
  imports: [AuthModule, LoggerModule, NotificationModule],
  controllers: [UserController],
  providers: [PrismaService, UserService , DocService, TemplateService],
})
export class UserModule {}
