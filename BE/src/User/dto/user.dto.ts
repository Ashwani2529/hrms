import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsInt,
  IsBoolean,
  IsObject,
} from 'class-validator';
import {
  GENDER,
  SALUTAION,
  EMPLOYEMENT_TYPE,
  STATUS_TYPE,
  Prisma,
} from '@prisma/client';

export class CreateUser {
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsInt()
  sick_leaves?: number;

  @IsOptional()
  @IsInt()
  casual_leaves?: number;

  @IsOptional()
  @IsInt()
  granted_leaves?: number;

  @IsOptional()
  @IsInt()
  unpaid_leaves?: number;

  @IsOptional()
  @IsInt()
  last_check_point?: number;

  @IsNotEmpty()
  @IsDateString()
  date_of_joining: string | Date;

  @IsNotEmpty()
  @IsString()
  company_id: string;

  @IsOptional()
  @IsDateString()
  date_of_birth: string | Date;

  @IsOptional()
  @IsEnum(GENDER)
  gender?: GENDER;

  @IsOptional()
  @IsEnum(STATUS_TYPE)
  status?: STATUS_TYPE;

  @IsOptional()
  @IsEnum(SALUTAION)
  salutation?: SALUTAION;

  @IsOptional()
  @IsEnum(EMPLOYEMENT_TYPE)
  employement_type?: EMPLOYEMENT_TYPE;
  
  @IsNotEmpty()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  middlename?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  personal_email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  role_id?: string;

  @IsOptional()
  @IsString()
  user_device_id?: string;

  @IsOptional()
  @IsObject()
  user_bank?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_address?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_permanent_address?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_documents?: Prisma.JsonObject;

  @IsOptional()
  @IsArray()
  emergency_contacts_data?: Prisma.JsonObject[];

  @IsOptional()
  @IsBoolean()
  sendSignedDoc?: boolean;
}
export class UpdateUser {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsEmail()
  user_email?: string;

  @IsOptional()
  @IsInt()
  sick_leaves?: number;

  @IsOptional()
  @IsInt()
  casual_leaves?: number;

  @IsOptional()
  @IsInt()
  unpaid_leaves?: number;

  @IsOptional()
  @IsInt()
  last_check_point?: number;

  @IsOptional()
  @IsString()
  user_password?: string;

  @IsOptional()
  @IsString()
  profile_photo?: string;

  @IsOptional()
  @IsDateString()
  date_of_joining: string | Date;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string | Date;

  @IsOptional()
  @IsEnum(GENDER)
  gender?: GENDER;

  @IsOptional()
  @IsEnum(STATUS_TYPE)
  status?: STATUS_TYPE;

  @IsOptional()
  @IsEnum(SALUTAION)
  salutation?: SALUTAION;

  @IsOptional()
  @IsEnum(EMPLOYEMENT_TYPE)
  employement_type?: EMPLOYEMENT_TYPE;


  @IsOptional()
  @IsString()
  firstname?: string;

  @IsOptional()
  @IsString()
  middlename?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsEmail()
  personal_email?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  role_id?: string;

  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  user_device_id?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsObject()
  user_bank?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_address?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_permanent_address?: Prisma.JsonObject;

  @IsOptional()
  @IsObject()
  user_documents?: Prisma.JsonObject;

  @IsOptional()
  @IsArray()
  emergency_contacts_data?: Prisma.JsonObject[];

  @IsOptional()
  @IsBoolean()
  sendSignedDoc?: boolean;
}

export class DeleteUser {
  @IsNotEmpty()
  @IsArray()
  users: string[];
}

enum VerifyUserStatus {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}
export class VerifyUser {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsEnum(VerifyUserStatus)
  status: VerifyUserStatus;

  @IsOptional()
  @IsString()
  reject_reason?: string;
}


export class GenerateUserSampleExcel {
  @IsOptional()
  @IsString()
  templateId: string
}