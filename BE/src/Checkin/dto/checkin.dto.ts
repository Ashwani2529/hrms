import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { LOG_TYPE } from '@prisma/client';

export class CreateAutomateCheckIn {
  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  user_device_id: string;

  @IsNotEmpty()
  @IsEnum(LOG_TYPE)
  log_type: LOG_TYPE;

  @IsNotEmpty()
  @IsDateString()
  log_time: Date;

  @IsOptional()
  @IsString()
  device_id?: string;
}

export class CreateManualCheckIn {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsEnum(LOG_TYPE)
  log_type: LOG_TYPE;

  @IsNotEmpty()
  @IsString()
  shift_id: string;

  @IsNotEmpty()
  @IsDateString()
  log_time: Date;

  @IsOptional()
  @IsString()
  device_id?: string;
}

export class UpdateCheckIn {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  shift_id?: string;

  @IsOptional()
  @IsEnum(LOG_TYPE)
  log_type: LOG_TYPE;

  @IsOptional()
  @IsString()
  log_time?: string;

  @IsOptional()
  @IsString()
  device_id?: string;
}

export class CheckinDelete {
  @IsNotEmpty()
  @IsArray()
  checkins: string[];
}
