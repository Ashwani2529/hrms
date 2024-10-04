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
import { LeaveService } from './leave.service';
import { Request, Response } from 'express';
import { CreateLeave, DeleteLeave, UpdateLeave } from './dto/leave.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('leave')
@ApiBearerAuth()
@ApiTags('Leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR","EMP"])
  @Get('/withinfo')
  async getAllWithInfo(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('status') status: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const leaves = await this.leaveService.getAllWithInfo(
      search,
      startDate,
      endDate,
      type,
      status,
      page,
      limit,
      req?.userId ?? null
    );
    return res.status(200).json(leaves);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get()
  async getAll(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('status') status: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const leaves = await this.leaveService.getAll(
      search,
      startDate,
      endDate,
      type,
      status,
      page,
      limit,
      req?.userId ?? null
    );
    return res.status(200).json(leaves);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: Request | any, @Res() res: Response) {
    const leave = await this.leaveService.getOne(id,req?.userId ?? null)     // for emp only
    return res.status(200).json(leave);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get('/leavesStats/:id')
  async getLeavesStats(@Param('id') id: string, @Req() req: Request | any, @Res() res: Response) {
    const leave = await this.leaveService.getLeavesStats(req?.userId ?? id)     // for emp only
    return res.status(200).json(leave);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Post()
  async create(@Body() body: CreateLeave, @Req() req: Request | any, @Res() res: Response) {
    const leave = await this.leaveService.create(body , req?.userId ?? null);
    res.status(201).json(leave);
    await this.logs.LOG(req.user, 'Leave created', LogType.Create, body,
    null, leave?.leave_id , 'LEAVE' , "created"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Body() body: DeleteLeave, @Req() req: Request | any, @Res() res: Response) {
    const leave = await this.leaveService.delete(body);
    res.status(201).json(leave);
    await this.logs.LOG(req.user, 'Leave deleted', LogType.Delete, body,
    null, body?.leaves , 'LEAVE' , "deleted"
    );
    return;
  }

  
  @Roles(["ADMIN","HR"])
  @Put(':id')
  async update(
    @Param('id') leaveId: string,
    @Body() body: UpdateLeave,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const leave = await this.leaveService.update(leaveId, body);
    res.status(200).json(leave);
    await this.logs.LOG(req.user, 'Leave updated', LogType.Update, { leaveId, body },
    null, leaveId , "LEAVE" , "updated" , body
    );
    return;
  }
}
