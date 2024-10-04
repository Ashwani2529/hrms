import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { LEAVE_TYPE, LEAVE_STATUS } from '@prisma/client';

export class CreateLeave {
  @IsNotEmpty()
  @IsString()
  leave_name: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  leave_description?: string;

  @IsNotEmpty()
  @IsEnum(LEAVE_TYPE)
  leave_type: LEAVE_TYPE;

  @IsNotEmpty()
  @IsEnum(LEAVE_STATUS)
  leave_status: LEAVE_STATUS;

  @IsNotEmpty()
  @IsDateString()
  leave_start_date: string | Date;

  @IsNotEmpty()
  @IsDateString()
  leave_end_date: string | Date;
}

export class UpdateLeave {
  @IsOptional()
  @IsString()
  leave_name: string;

  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  leave_description?: string;

  @IsOptional()
  @IsEnum(LEAVE_TYPE)
  leave_type: LEAVE_TYPE;

  @IsOptional()
  @IsEnum(LEAVE_STATUS)
  leave_status: LEAVE_STATUS;

  @IsOptional()
  @IsDateString()
  leave_start_date: string | Date;

  @IsOptional()
  @IsDateString()
  leave_end_date: string | Date;
}

export class DeleteLeave {
  @IsNotEmpty()
  @IsArray()
  leaves: string[];
}
