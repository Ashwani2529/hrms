import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateClient {
  @IsNotEmpty()
  @IsString()
  client_name: string;

  @IsOptional()
  @IsString()
  client_details?: string;

  @IsOptional()
  @IsString()
  client_logo?: string;

  @IsOptional()
  @IsNumber()
  day_hour_payment?: number;

  @IsOptional()
  @IsNumber()
  night_hour_payment?: number;

  @IsOptional()
  day_hour_start?: string | Date;

  @IsOptional()
  night_hour_start?: string | Date;
}

export class UpdateClient {
  @IsOptional()
  @IsString()
  client_name?: string;

  @IsOptional()
  @IsString()
  client_details?: string;

  @IsOptional()
  @IsString()
  client_logo?: string;

  @IsOptional()
  @IsNumber()
  day_hour_payment?: number;

  @IsOptional()
  @IsNumber()
  night_hour_payment?: number;

  @IsOptional()
  day_hour_start?: string | Date;

  @IsOptional()
  night_hour_start?: string | Date;
}
export class DeleteClient {
  @IsNotEmpty()
  @IsArray()
  clients: string[];
}

export class ChangeClient {
  @IsNotEmpty()
  @IsString()
  swap_shift_id: string;

  @IsNotEmpty()
  @IsString()
  to_client: string;
}
