import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptService } from './bcrypt.service';
import { JwtModule } from '@nestjs/jwt';
import { DocService } from 'src/User_Doc/doc.service';
import { NotificationModule } from 'src/Notification/notification.module';
import { TemplateModule } from 'src/Templates/template.module';
import { TemplateService } from 'src/Templates/template.service';

@Module({
  imports: [NotificationModule,TemplateModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, PrismaService, DocService , TemplateService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
