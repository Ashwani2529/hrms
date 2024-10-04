import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ATTENDANCE_TYPE } from '@prisma/client';

export class CreateAttendance {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsEnum(ATTENDANCE_TYPE)
  status: ATTENDANCE_TYPE;

  @IsNotEmpty()
  @IsDateString()
  attendance_date: string | Date;

  @IsOptional()
  @IsString()
  shift_id?: string;

  @IsOptional()
  @IsString()
  check_in_id?: string;

  @IsOptional()
  @IsString()
  check_out_id?: string;
}

export class UpdateAttendance {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsEnum(ATTENDANCE_TYPE)
  status?: ATTENDANCE_TYPE;

  @IsOptional()
  @IsDateString()
  attendance_date?: string | Date;

  @IsOptional()
  @IsString()
  shift_id?: string;

  @IsOptional()
  @IsString()
  check_in_id?: string;

  @IsOptional()
  @IsString()
  check_out_id?: string;
}

export class DeleteAttendance {
  @IsNotEmpty()
  @IsArray()
  attendances: string[];
}

export class AutoCreateAttendance {
  @IsNotEmpty()
  @IsString()
  shift_id: string;
}
