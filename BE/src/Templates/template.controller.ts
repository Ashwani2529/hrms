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
  Ip,
} from '@nestjs/common'; 
import { Request, Response } from 'express';
import { CreateTemplate, DeleteTemplate, UpdateTemplate } from './dto/template.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { TemplateService } from './template.service';
import { RealIP } from 'nestjs-real-ip';

@Controller('template')
@ApiBearerAuth()
@ApiTags('template')
export class TemplateController {
  constructor(
    private readonly templateService : TemplateService,
    private readonly logs: LoggerService,
  ) {}


  @Roles(["ADMIN","HR"])
  @Get("templateVariableScope")
  async getTemplateVariableScopes(@Req() req: Request | any, @Res() res: Response) {
    const scopes = await this.templateService.getTemplateVariableScopes() 
    return res.status(200).json(scopes);
  }

  @Roles(["ADMIN","HR"])
  @Get()
  async getAllTemplates(@Req() req: Request | any, @Res() res: Response) {
    const template = await this.templateService.getAllTemplates() 
    return res.status(200).json(template);
  }


  @Roles(["ADMIN","HR"])
  @Get(":templateid")
  async getTemplateById(@Param('templateid') id: string, @Req() req: Request | any, @Res() res: Response) {
    const template = await this.templateService.getTemplateById(id) 
    return res.status(200).json(template);
  }


  @Roles(["ADMIN","HR"])
  @Post()
  async create(@Body() body: CreateTemplate, @Req() req: Request | any, @Res() res: Response) {
    const template = await this.templateService.create(body);
    res.status(201).json(template);
    // await this.logs.LOG(req.user, 'Remark created', LogType.Create, body,
    // null, leave?.remark_id , 'LEAVE' , "created"
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Body() body: DeleteTemplate, @Req() req: Request | any, @Res() res: Response) {
    const template= await this.templateService.delete(body);
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
    @Body() body: UpdateTemplate,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const template = await this.templateService.update(leaveId, body);
    res.status(200).json(template);
    // await this.logs.LOG(req.user, 'Leave updated', LogType.Update, { leaveId, body },
    // null, leaveId , "LEAVE" , "updated" , body
    // );
    return;
  }
}
