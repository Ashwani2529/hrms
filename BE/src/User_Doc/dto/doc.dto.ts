import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';

enum UPDATE_TYPE {
  NORMAL = "NORMAL",
  APPROVED = 'APPROVED',
  REJECTED = "REJECTED"
}


export class CreateDoc {
  @IsNotEmpty()
  @IsString()
  usrdoc_title: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;


  @IsNotEmpty()
  @IsString()
  template_id: string;

  @IsOptional()
  @IsString()
  usrdoc_description: string;


  @IsNotEmpty()
  @IsObject()
  usrdoc_variables_data: any;
}


export class updateDoc {
  @IsOptional()
  @IsString()
  usrdoc_title: string;

  @IsOptional()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  template_id: string;

  @IsOptional()
  @IsString()
  usrdoc_description: string;

  @IsOptional()
  @IsArray()
  usrdoc_variables_data: string[];
  
  @IsOptional()
  @IsString()
  sign_url: string;


  @IsNotEmpty()
  @IsEnum(UPDATE_TYPE)
  update_type: UPDATE_TYPE;
}


export class DeleteDocs {
  @IsNotEmpty()
  @IsArray()
  docs: string[];
}

export class SignDoc {
  @IsNotEmpty()
  buffer: Buffer;
}

export class GenerateDocSampleExcel {
  @IsNotEmpty()
  @IsArray()
  userIds: string[]

  
  @IsNotEmpty()
  @IsString()
  template_id: string
}

export class UploadBulkDoc {
  @IsNotEmpty()
  @IsString()
  template_id: string
}

export class UploadBulkDocWithoutFile {
  @IsNotEmpty()
  @IsString()
  template_id: string

  @IsNotEmpty()
  @IsArray()
  userIds: string[]
}