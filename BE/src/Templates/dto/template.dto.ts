import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateTemplate {
  @IsNotEmpty()
  @IsString()
  template_name: string;

  @IsOptional()
  @IsString()
  template_description: string;

  @IsNotEmpty()
  @IsString()
  template_content: string;

  @IsNotEmpty()
  @IsString()
  template_content_html: string;

  @IsNotEmpty()
  @IsArray()
  variable_scopes: string[];
}


export class UpdateTemplate {
  @IsOptional()
  @IsString()
  template_name: string;

  @IsOptional()
  @IsString()
  template_description: string;

  @IsOptional()
  @IsString()
  template_content: string;


  @IsOptional()
  @IsString()
  template_content_html: string;

  @IsNotEmpty()
  @IsArray()
  variable_scopes: string[];
}


export class DeleteTemplate {
  @IsNotEmpty()
  @IsArray()
  templates: string[];
}
