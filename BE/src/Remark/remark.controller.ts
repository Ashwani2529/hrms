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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateRemark, DeleteRemark, UpdateRemark } from './dto/remark.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { RemarkService } from './remark.service';

@Controller('remark')
@ApiBearerAuth()
@ApiTags('remark')
export class RemarkController {
  constructor(
    private readonly remarkService : RemarkService,
    private readonly logs: LoggerService,
  ) {}


  @Roles(["ADMIN","HR","EMP"])
  @Get(':userid')
  async getUserRemarks(@Param('userid') id: string, @Req() req: Request | any, @Res() res: Response) {
    const remarks = await this.remarkService.getUserRemarks(id,req?.userId ?? null)     // for emp only
    return res.status(200).json(remarks);
  }


  @Roles(["ADMIN","HR"])
  @Post()
  async create(@Body() body: CreateRemark, @Req() req: Request | any, @Res() res: Response) {
    const remark = await this.remarkService.create(body);
    res.status(201).json(remark);
    // await this.logs.LOG(req.user, 'Remark created', LogType.Create, body,
    // null, leave?.remark_id , 'LEAVE' , "created"
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Body() body: DeleteRemark, @Req() req: Request | any, @Res() res: Response) {
    const remark= await this.remarkService.delete(body);
    res.status(201).json(remark);
    // await this.logs.LOG(req.user, 'Leave deleted', LogType.Delete, body,
    // null, body?.remarks , 'LEAVE' , "deleted"
    // );
    return;
  }

  
  @Roles(["ADMIN","HR"])
  @Put(':id')
  async update(
    @Param('id') leaveId: string,
    @Body() body: UpdateRemark,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const remark = await this.remarkService.update(leaveId, body);
    res.status(200).json(remark);
    // await this.logs.LOG(req.user, 'Leave updated', LogType.Update, { leaveId, body },
    // null, leaveId , "LEAVE" , "updated" , body
    // );
    return;
  }
}
