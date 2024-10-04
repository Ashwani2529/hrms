import { PrismaService } from 'src/prisma.service';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { emailConfig } from '../Config/emailConfig';
import { BcryptService } from './bcrypt.service';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import { ForgotPassword } from './dto/user.dto';
import { random } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
  ) {}

  async generateAccessToken(user: Partial<User | any>) {
    let permissions: string[] = [];
    let role: any = undefined;
    if (user.role_id) {
      const p_flags = await this.prisma.role_permission.findMany({
        where: {
          role_id: user.role_id,
        },
        include: {
          permission_flag: true,
        },
      });
      permissions = p_flags?.map(p => p.permission_flag.permission_flag_name);
      role = user.role?.role_name;
    }

    const payload = {
      userId: user.user_id,
      email: user.user_email,
      name: user.user_name ?? user.user_email,
      role: role,
      p_flags: permissions,
      company_id: user.company_id,
    };

    const accessToken = this.jwtService.sign(payload);
    console.log('access token', accessToken);
    return accessToken;
  }

  replaceVariables(htmlString, replacements) {
    return htmlString.replaceAll(/{{\s*([\w_]+)\s*}}/g, (match, p1) => {
      return replacements.hasOwnProperty(p1) ? replacements[p1] : match;
    });
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const user: any = await this.prisma.user.findUnique({
        where: { user_email: email },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid email');
      }

      if (user.role_id) {
        const permissions = await this.prisma.role_permission.findMany({
          where: {
            role_id: user.role_id,
          },
          include: {
            permission_flag: true,
          },
        });
        user.p_flags = permissions?.map(p => p.permission_flag.permission_flag_name);
      }

      const isPasswordMatch = await this.bcryptService.compare(
        password,
        user.user_password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid password');
      }
      
      return {
        user,
        access_token: await this.generateAccessToken(user),
      };
    } catch (error) {
      throw new InternalServerErrorException({
        error: error,
        message: error?.message ?? 'internal server error',
      });
    }
  }

  async send_reset_email(email: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_email: email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email');
      }

      const buffer = crypto.randomUUID();

      const expiryTime = Date.now() + 48 * 60 * 1000;
      const uuid_to_save = buffer + '_' + expiryTime;

      const a =  await this.prisma.handlePrismaError(this.prisma.user.update({
        where: { user_email: email },
        data: {
          otp: uuid_to_save,
        },
      }));

      const transporter: any = await emailConfig();
      let message = {
        from: 'Heliverse pm@heliverse.com',
        to: email,
        subject: 'Click this Link for Onboarding process:',
        html:
          '<h3>OTP for account verification is </h3>' +
          "<h1 style='font-weight:bold;'>" +
          process.env.BASE_FRONTEND_URL +
          '/auth/create-password' +
          '?utken=' +
          buffer +
          '&email=' +
          email +
          '</h1>',
      };
      //TODO : trnasport not working
      await transporter.sendMail(message);

      return {
        status: true,
        uuid_to_save,
        message: 'Onboarding link has been sent to your email',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        error: error,
        message: 'Failed to Send mail',
      });
    }
  }

  async send_onboarding_email(email: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_email: email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email');
      }

      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: '9185b96c-8b3e-4e42-a5fb-899ddf2b66ag' },
      });

      if (!template) {
        throw new ConflictException('Onboarding Template not found');
      }

      const buffer = crypto.randomUUID();

      const expiryTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
      const uuid_to_save = buffer + '_' + expiryTime;

      const a =  await this.prisma.handlePrismaError(this.prisma.user.update({
        where: { user_email: email },
        data: {
          otp: uuid_to_save,
        },
      }));

      // template varaible data --------
      const variableData = {
        link:
          process.env.BASE_FRONTEND_URL +
          '/auth/create-password' +
          '?utken=' +
          buffer +
          '&email=' +
          email,
          expireTime: new Date(expiryTime).toUTCString()
      };

      const updatedHtml = this.replaceVariables(
        template?.template_content_html,
        {...variableData,...user},
      );

      const transporter: any = await emailConfig();

      let message = {
        from: 'Heliverse pm@heliverse.com',
        to: email,
        subject: 'Welcome to the HRMS By Keystone Security',
        html: updatedHtml
      };

      //TODO : trnasport not working
      await transporter.sendMail(message);

      return {
        status: true,
        uuid_to_save,
        message: 'Onboarding link has been sent to your email',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        error: error,
        message: 'Failed to Send mail',
      });
    }
  }

  async forgetPassword(data: ForgotPassword): Promise<any> {
    try {
      const { email, password, utken } = data;

      const cachedOtpData =  await this.prisma.user.findUnique({
        where: { user_email: email },
      });

      if(!cachedOtpData){
        throw new BadRequestException('Invalid Email');
      }

      if (!cachedOtpData?.otp) {
        throw new BadRequestException('Invalid Link !!');
      }

      const arr = cachedOtpData.otp.split('_');
      const cachedOtp = arr[0];
      const cachedExpiryTime = parseInt(arr[1]);

      if (cachedOtpData && cachedOtp !== utken) {
        throw new BadRequestException('Invalid Link !!');
      }

      if (cachedOtpData && cachedOtp === utken && cachedExpiryTime >= Date.now()) {
        await this.prisma.handlePrismaError(this.prisma.user.update({
          where: { user_email: email },
          data: {
            user_password: await this.bcryptService.hash(password),
            otp: null,
          },
        }));

        return await this.login(email, password);
      } else {
        await this.prisma.handlePrismaError(this.prisma.user.update({
          where: { user_email: email },
          data: {
            otp: null,
          },
        }));
        throw new BadRequestException('Link expired !!');
      }
    } catch (error) {
      throw new InternalServerErrorException({
        error: error,
        message: error.message ?? 'internal server error',
      });
    }
  }

  async send_otp_email(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);

      if (!payload) {
        throw new ConflictException('Invalid Token');
      }

      if (payload?.expiryTime < Date.now()) {
        throw new ConflictException('Token has been expired');
      }

      if (!payload?.user_email) {
        throw new ConflictException('Invalid Token!!!');
      }

      const user = await this.prisma.user.findUnique({
        where: { user_email: payload?.user_email },
      });

      if (!user) {
        throw new BadRequestException('Invalid email');
      }

      const buffer = Math.floor(Math.random() * 1000000);

      const expiryTime = Date.now() + 48 * 60 * 1000;
      const uuid_to_save = buffer + '_' + expiryTime;

      const a =  await this.prisma.handlePrismaError(this.prisma.user.update({
        where: { user_email: payload?.user_email },
        data: {
          otp: uuid_to_save,
        },
      }));

      const transporter: any = await emailConfig();

      let message = {
        from: 'Heliverse pm@heliverse.com',
        to: payload?.user_email,
        subject: 'OTP For verification',
        html:
          '<h3>OTP for account verification is: </h3>' +
          "<h1 style='font-weight:bold;'>" +
          buffer +
          '</h1>',
      };
      //TODO : trnasport not working
      await transporter.sendMail(message);

      return {
        status: true,
        message: 'Verification Code has been sent to your email',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        error: error,
        message: error.message ?? 'internal server error',
      });
    }
  }
}
