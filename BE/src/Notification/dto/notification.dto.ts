import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from '@prisma/client';
import { Optional } from '@nestjs/common';

export class NotificationSeen {
  @IsNotEmpty()
  @IsString()
  notifications: string;
}

export class SendNotification {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_TYPE)
  notification_type: NOTIFICATION_TYPE;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_STATUS)
  notification_status: NOTIFICATION_STATUS;

  @IsOptional()
  @IsArray()
  roles: string[];


  @IsOptional()
  @IsArray()
  userId: string[];
}

export class CreateNotification {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_TYPE)
  notification_type: NOTIFICATION_TYPE;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_STATUS)
  notification_status: NOTIFICATION_STATUS;

  @IsNotEmpty()
  @IsArray()
  users: string[];
}

export class UpdateNotification {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(NOTIFICATION_TYPE)
  notification_type?: NOTIFICATION_TYPE;

  @IsOptional()
  @IsEnum(NOTIFICATION_STATUS)
  notification_status?: NOTIFICATION_STATUS;

  @IsOptional()
  @IsArray()
  users?: string[];
}

export class DeleteNotification {
  @IsNotEmpty()
  @IsArray()
  notifications: string[];
}
