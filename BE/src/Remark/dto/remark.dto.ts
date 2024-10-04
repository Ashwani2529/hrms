import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { LEAVE_TYPE, LEAVE_STATUS, REMARK_TYPE } from '@prisma/client';

export class CreateRemark {
  @IsOptional()
  @IsString()
  remark_title: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  remark_description: string;

  @IsOptional()
  @IsNumber()
  remark_level: number;

  @IsNotEmpty()
  @IsEnum(REMARK_TYPE)
  remark_type: REMARK_TYPE;

  @IsNotEmpty()
  @IsDateString()
  remark_date: string | Date;
}


export class UpdateRemark {
  @IsOptional()
  @IsString()
  remark_title: string;

  @IsOptional()
  @IsString()
  remark_description: string;

  @IsOptional()
  @IsNumber()
  remark_level: number;

  @IsOptional()
  @IsEnum(REMARK_TYPE)
  remark_type: REMARK_TYPE;

  @IsOptional()
  @IsDateString()
  remark_date: string | Date;
}



export class DeleteRemark {
  @IsNotEmpty()
  @IsArray()
  remarks: string[];
}
