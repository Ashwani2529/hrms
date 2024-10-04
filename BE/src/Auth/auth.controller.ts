import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Ip,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPassword, Login, SendForgotEmail, signTheDoc, verifyDocSignToken } from './dto/user.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { DocService } from 'src/User_Doc/doc.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RealIP } from 'nestjs-real-ip';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly docService: DocService
  ) {}

  @Post('login')
  async login(@Res() response: Response, @Body() body: Login) {
    try {
      return response
        .status(201)
        .json(await this.authService.login(body.email, body.password));
    } catch (err) {
      console.log(err);
      return response.status(err.status).json(err.response);
    }
  }

  @Post('send-password-email')
  async send_email(@Body() data: SendForgotEmail, @Res() response: Response) {
    try {
      return response
        .status(201)
        .json(await this.authService.send_reset_email(data.email));
    } catch (err) {
      const { error } = err.response;
      return response.status(error?.status).json(error.response);
    }
  }

  @Post('change-password')
  async forgetPassword(@Body() data: ForgotPassword, @Res() response: Response) {
    try {
      return response.status(201).json(await this.authService.forgetPassword(data));
    } catch (err) {
      const { error } = err.response;
      return response.status(error.status).json(error.response);
    }
  }


  @Post("verifyDocSignToken")
  async verifyToken(@Body() data: verifyDocSignToken, @Req() req: Request | any, @Res() res: Response) {
    const html = await this.docService.verifyDocToken(data?.token);
    res.status(201).json({htmlContent:html});
    return;
  }


  @Post("verifyAccountByOtp")
  async verifyByOtp(@Body() data: verifyDocSignToken, @Req() req: Request | any, @Res() res: Response) {
    const result = await this.authService.send_otp_email(data?.token);
    res.status(201).json(result);
    return;
  }


  @Post("signDoc")
  @UseInterceptors(FileInterceptor('file'))
  async signDoc( @UploadedFile() file: any,@RealIP() ip:string, @Body() data: signTheDoc, @Req() req: Request | any, @Res() res: Response) {
    const html = await this.docService.signTheDoc(data.token,file, data.code, ip);
    res.status(201).json({htmlContent:html});
    return;
  }
}