import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { HOLIDAY_TYPE } from '@prisma/client';
import { Optional } from '@nestjs/common';

enum UPDATE_TYPE {
  SINGLE_HOLIDAY = 'SINGLE_HOLIDAY',
  FOLLOW_UP_HOLIDAY = 'FOLLOW_UP_HOLIDAY',
}


export class CreateHoliday {
  @IsNotEmpty()
  @IsString()
  holiday_name: string;

  @IsOptional()
  @IsDateString()
  holiday_date: string | Date;

  @IsNotEmpty()
  @IsEnum(HOLIDAY_TYPE)
  holiday_type: HOLIDAY_TYPE;

  @IsOptional()
  @IsArray()
  user_holiday: string[];

  @IsOptional()
  @IsArray()
  custom_repeat: string[];
}

export class UpdateHoliday {
  @IsOptional()
  @IsString()
  holiday_name: string;

  @IsNotEmpty()
  @IsDateString()
  holiday_date: string | Date;

  @IsOptional()
  @IsArray()
  user_holiday: string[];

  @IsOptional()
  @IsArray()
  custom_repeat: string[];

  @IsOptional()
  @IsEnum(UPDATE_TYPE)
  update_type: UPDATE_TYPE;
}

export class DeleteHoliday {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @IsDateString()
  holiday_date: string | Date;

  @Optional()
  @IsArray()
  user_holidays: string[];

  @IsOptional()
  @IsEnum(UPDATE_TYPE)
  delete_type: UPDATE_TYPE;
}
