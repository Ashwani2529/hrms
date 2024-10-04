import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { LoggerModule } from 'src/Logger/logger.module';
import { DocService } from './doc.service';
import { DocController } from './doc.controller';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from 'src/Notification/notification.module';
import { AuthModule } from 'src/Auth/auth.module';
import { TemplateModule } from 'src/Templates/template.module';
import { TemplateService } from 'src/Templates/template.service';

@Module({
  imports: [
    TemplateModule,NotificationModule,AuthModule,LoggerModule,JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    })
  ],
  controllers: [DocController],
  providers: [PrismaService, DocService , TemplateService],
})
export class DocModule {}
