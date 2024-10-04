import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'; 
import { Request, Response } from 'express';
import { CreateDoc, DeleteDocs, GenerateDocSampleExcel, UploadBulkDoc, UploadBulkDocWithoutFile, updateDoc } from './dto/doc.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { DocService } from './doc.service';
import { DOCS_STATUS_TYPE } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { unlinkSync } from 'fs';

@Controller('user-doc')
@ApiBearerAuth()
@ApiTags('user-doc')
export class DocController {
  constructor(
    private readonly docService : DocService,
    private readonly logs: LoggerService,
  ) {}


  @Roles(["ADMIN","HR","EMP"])
  @Get()
  async getAllDocs(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('status') status: DOCS_STATUS_TYPE = null,
    @Query('limit') limit?: string,
    @Query('page') page?: string
    ) {
    const result = await this.docService.getAllDocs(search,status,page,limit,req?.userId ?? null) 
    return res.status(200).json(result);
  }

  

  @Roles(["ADMIN","HR"])
  @Post()
  async create(@Body() body: CreateDoc, @Req() req: Request | any, @Res() res: Response) {
    const doc = await this.docService.create(body);
    res.status(201).json(doc);
    // await this.logs.LOG(req.user, 'Remark created', LogType.Create, body,
    // null, leave?.remark_id , 'LEAVE' , "created"
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Body() body: DeleteDocs, @Req() req: Request | any, @Res() res: Response) {
    const template= await this.docService.delete(body);
    res.status(201).json(template);
    // await this.logs.LOG(req.user, 'Leave deleted', LogType.Delete, body,
    // null, body?.remarks , 'LEAVE' , "deleted"
    // );
    return;
  }

  
  @Roles(["ADMIN","HR"])
  @Put(':id')
  async update(
    @Param('id') leaveId: string,
    @Body() body: updateDoc,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const doc = await this.docService.update(leaveId, body);
    res.status(200).json(doc);
    // await this.logs.LOG(req.user, 'Leave updated', LogType.Update, { leaveId, body },
    // null, leaveId , "LEAVE" , "updated" , body
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('create-multiple')
  @UseInterceptors(FileInterceptor('file'))
  async createMultipleDoc(
    @UploadedFile() file: any,
    @Body() data: UploadBulkDoc,
    @Res() res: Response,
    @Req() req: Request | any,
  ) {
    const user = await this.docService.createMultipleDoc(file, data?.template_id, );
    res.status(201).json(user);
    // await this.logs.LOG(req.user, 'Created Multiple Users', LogType.Create,null,
    // `${req.user?.name} created mutiple users with file upload`
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('create-multiple-without-file')
  async createMultipleDocWithoutFile(
    @UploadedFile() file: any,
    @Body() data: UploadBulkDocWithoutFile,
    @Res() res: Response,
    @Req() req: Request | any,
  ) {
    const user = await this.docService.createMultipleDocWithoutFile(data?.template_id, data?.userIds);
    res.status(201).json(user);
    // await this.logs.LOG(req.user, 'Created Multiple Users', LogType.Create,null,
    // `${req.user?.name} created mutiple users with file upload`
    // );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('generateDocSampleExcel')
  async generateDocSampleExcel(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: GenerateDocSampleExcel,
  ) {
    await this.docService.generateSampleExcel(body);

    // Send the file to the frontend
    res.download('./data.xlsx', 'bulk-document-sample.xlsx', err => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        // Delete the temporary file after download completes
        unlinkSync('./data.xlsx');
      }
    });

    // await this.logs.LOG(
    //   req.user,
    //   'Bulk User Sample Generated',
    //   LogType.Create,
    //   null,
    //   `${req.user?.name} generated salary sample for bulk update`,
    // );

    return;
  }
}
