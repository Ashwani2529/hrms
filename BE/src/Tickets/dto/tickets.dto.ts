import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { REQUEST_STATUS, TICKET_TYPE } from '@prisma/client';

export class CreateTicket {
  @IsOptional()
  @IsString()
  ticket_title?: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  ticket_description?: string;

  @IsNotEmpty()
  @IsString()
  ticket_type: TICKET_TYPE;

  @IsNotEmpty()
  @IsDateString()
  ticket_date: string | Date;
}


export class UpdateTickets {
  @IsOptional()
  @IsString()
  ticket_title: string;

  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  ticket_description: string;

  @IsOptional()
  @IsString()
  ticket_type: TICKET_TYPE;

  @IsOptional()
  @IsEnum(REQUEST_STATUS)
  ticket_status: REQUEST_STATUS;

  @IsOptional()
  @IsDateString()
  ticket_date: string | Date;
}



export class DeleteTickets {
  @IsNotEmpty()
  @IsArray()
  tickets: string[];
}
