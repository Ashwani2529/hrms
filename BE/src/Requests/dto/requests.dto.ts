import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { REQUEST_STATUS, REQUEST_TYPE } from '@prisma/client';

export class CreateRequest {
  @IsOptional()
  @IsString()
  request_title?: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  request_description?: string;

  @IsNotEmpty()
  @IsString()
  request_type: REQUEST_TYPE;

  @IsOptional()
  @IsDateString()
  request_date: string | Date;

  @IsOptional()
  @IsDateString()
  checkin_time: string | Date;

  @IsOptional()
  @IsDateString()
  checkout_time: string | Date;
}


export class UpdateRequests {
  @IsOptional()
  @IsString()
  request_title: string;

  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  request_description: string;

  @IsOptional()
  @IsString()
  request_type: REQUEST_TYPE;

  @IsOptional()
  @IsEnum(REQUEST_STATUS)
  request_status: REQUEST_STATUS;

  @IsOptional()
  @IsDateString()
  request_date: string | Date;

  @IsOptional()
  @IsDateString()
  checkin_time: string | Date;

  @IsOptional()
  @IsDateString()
  checkout_time: string | Date;
}



export class DeleteRequests {
  @IsNotEmpty()
  @IsArray()
  requests: string[];
}
