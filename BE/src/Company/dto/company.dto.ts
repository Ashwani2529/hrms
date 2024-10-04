import { OT_PAY_TYPE, SALARY_TYPE } from '@prisma/client';
import { IsNotEmpty, IsString, IsOptional, IsUrl, IsNumber, IsEnum } from 'class-validator';

export class CreateCompany {
  @IsNotEmpty()
  @IsString()
  company_name: string;

  @IsNotEmpty()
  @IsString()
  company_address: string;

  @IsOptional()
  @IsString()
  company_details?: string;

  @IsOptional()
  @IsUrl()
  company_logo?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNotEmpty()
  @IsString()
  smtp_username?: string;

  @IsNotEmpty()
  @IsString()
  smtp_password?: string;

  @IsOptional()
  @IsNumber()
  standarized_shift_hours?: number;

  @IsOptional()
  @IsNumber()
  standard_monthly_days?: number;

  @IsOptional()
  @IsNumber()
  min_half_day_hours?: number;

  @IsOptional()
  @IsEnum(OT_PAY_TYPE)
  ot_pay_type?: OT_PAY_TYPE;

  @IsOptional()
  @IsEnum(SALARY_TYPE)
  salary_freq: SALARY_TYPE;

  @IsOptional()
  @IsNumber()
  payment_day_of_month: number;

  @IsOptional()
  @IsString()
  from_date: string;

}

export class UpdateCompany {
  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_address: string;

  @IsOptional()
  @IsString()
  company_details?: string;

  @IsOptional()
  @IsUrl()
  company_logo?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  smtp_username?: string;


  @IsOptional()
  @IsString()
  smtp_password?: string;

  @IsOptional()
  @IsNumber()
  standarized_shift_hours?: number;

  @IsOptional()
  @IsNumber()
  standard_monthly_days?: number;

  @IsOptional()
  @IsNumber()
  min_half_day_hours?: number;

  @IsOptional()
  @IsEnum(OT_PAY_TYPE)
  ot_pay_type?: OT_PAY_TYPE;

  @IsOptional()
  @IsEnum(SALARY_TYPE)
  salary_freq: SALARY_TYPE;

  @IsOptional()
  @IsNumber()
  payment_day_of_month: number;

  @IsOptional()
  @IsString()
  from_date: string;
}
