import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateRoll {
  @IsNotEmpty()
  @IsString()
  role_name: string;
}

export class UpdateRoll {
  @IsOptional()
  @IsString()
  role_name: string;
}

export class DeleteRoll {
  @IsNotEmpty()
  @IsArray()
  roles: string[];
}

export class AddPermission {
  @IsNotEmpty()
  @IsArray()
  permissions: string[];
}
