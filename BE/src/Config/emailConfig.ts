import { InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';


export async function emailConfig(): Promise<string | null> {
  try {
    let config = {
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    };
    let transporter: any = nodemailer.createTransport(config);
    return transporter;
  } catch (error) {
    throw new InternalServerErrorException({
      error: error,
      message: 'internal server error',
      details: error.message,
    });
  }
}
