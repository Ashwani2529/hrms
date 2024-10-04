import { SHIFT_REPEAT, SHIFT_STATUS } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsBoolean,
  IsEnum,
} from 'class-validator';

enum UPDATE_TYPE {
  SINGLE_SHIFT = 'SINGLE_SHIFT',
  ALL_SHIFT = 'ALL_SHIFT',
  FOLLOW_UP_SHIFT = 'FOLLOW_UP_SHIFT',
}

export class CreateShift {
  @IsNotEmpty()
  @IsString()
  shift_name: string;

  @IsNotEmpty()
  @IsDateString()
  start_time: string | Date;

  @IsNotEmpty()
  @IsDateString()
  end_time: string | Date;

  @IsNotEmpty()
  @IsNumber()
  begin_checkin: number;

  @IsNotEmpty()
  @IsNumber()
  begin_checkout: number;

  @IsNotEmpty()
  @IsBoolean()
  auto_attendance: boolean;

  @IsOptional()
  @IsString()
  shift_color?: string;

  @IsOptional()
  @IsDateString()
  lunch_break_start?: string | Date;

  @IsOptional()
  @IsDateString()
  lunch_break_end?: string | Date;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsEnum(SHIFT_STATUS)
  status?: SHIFT_STATUS;

  @IsOptional()
  @IsEnum(SHIFT_REPEAT)
  repeat?: SHIFT_REPEAT;

  @IsOptional()
  @IsArray()
  custom_repeat?: string[];

  @IsOptional()
  @IsArray()
  user_shift?: string[];
}

export class UpdateShift {
  @IsOptional()
  @IsString()
  shift_name?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string | Date;

  @IsOptional()
  @IsDateString()
  end_time?: string | Date;

  @IsOptional()
  @IsNumber()
  begin_checkin?: number;

  @IsOptional()
  @IsNumber()
  begin_checkout?: number;

  @IsOptional()
  @IsBoolean()
  auto_attendance?: boolean;

  @IsOptional()
  @IsString()
  shift_color?: string;

  @IsOptional()
  @IsDateString()
  lunch_break_start?: string | Date;

  @IsOptional()
  @IsDateString()
  lunch_break_end?: string | Date;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsEnum(SHIFT_STATUS)
  status?: SHIFT_STATUS;

  @IsOptional()
  @IsEnum(SHIFT_REPEAT)
  repeat?: SHIFT_REPEAT;

  @IsOptional()
  @IsString()
  repeat_days?: string;

  @IsOptional()
  @IsArray()
  user_shift?: string[];

  @IsOptional()
  @IsArray()
  custom_repeat?: string[];

  @IsOptional()
  @IsEnum(UPDATE_TYPE)
  update_type?: UPDATE_TYPE;
}

export class DeleteShift {
  @IsNotEmpty()
  @IsArray()
  shifts: string[];

  @IsOptional()
  @IsEnum(UPDATE_TYPE)
  delete_type: UPDATE_TYPE;
}

export class SwitchShifts {
  @IsNotEmpty()
  @IsArray()
  users: string[];

  @IsNotEmpty()
  @IsString()
  shift_id: string;
}

enum SWAP_TYPE {
  //NO CONFLICT
  SWAP = 'SWAP',
  CLONE = 'CLONE',
}

enum SWAP_CONFLICT {
  //CONFLICT
  NONE = 'NONE',
  MERGE = 'MERGE',
  REPLACE = 'REPLACE',
}
export class SwapShifts {
  @IsNotEmpty()
  @IsString()
  from_user_shift_id: string;

  @IsNotEmpty()
  @IsString()
  to_user_id: string;

  @IsNotEmpty()
  @IsEnum(SWAP_TYPE)
  swap_type: SWAP_TYPE;

  @IsNotEmpty()
  @IsEnum(SWAP_CONFLICT)
  swap_conflict?: SWAP_CONFLICT;

  @IsOptional()
  @IsString()
  conflict_shift_id?: string;
}


export class AssignShiftsByCode {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  shift_name: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: Date;

  @IsNotEmpty()
  @IsDateString()
  end_date?: Date;

  @IsNotEmpty()
  @IsBoolean()
  delete_shift?: boolean;
}