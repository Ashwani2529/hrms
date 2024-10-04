import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Login {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class SendForgotEmail {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ForgotPassword {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  utken: string;
}

export class verifyDocSignToken {
  @IsNotEmpty()
  token: string;
}


export class signTheDoc {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  code: string;
}

