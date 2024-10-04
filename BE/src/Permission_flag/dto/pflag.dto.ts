import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePflag {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdatePflag {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PflagDelete {
  @IsNotEmpty()
  @IsArray()
  pflags: string[];
}
