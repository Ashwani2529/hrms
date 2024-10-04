import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { Request, Response } from 'express';
import {
  AssignShiftsByCode,
  CreateShift,
  DeleteShift,
  SwapShifts,
  SwitchShifts,
  UpdateShift,
} from './dto/shift.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('shift')
@ApiBearerAuth()
@ApiTags('Shift')
export class ShiftController {
  constructor(
    private readonly shiftService: ShiftService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR"])
  @Get('availableEmployees')
  async getAvailableEmployees(
    @Req() req: Request,
    @Res() res: Response,
    @Query('shiftId') shiftId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    const employees = await this.shiftService.getAvailableEmployees(
      shiftId,
      startTime,
      endTime,
    );
    return res.status(200).json(employees);
  }

  @Roles(["ADMIN","HR"])
  @Get('allAssign')
  async getShifts(@Req() req: Request, @Res() res: Response) {
    const shifts = await this.shiftService.getAssignedShifts();
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get('withinfo')
  async getAllWithInfo(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('users') users: string = '',
    @Query('clients') clients: string = '',
  ) {
    const shifts = await this.shiftService.getAllWithInfo(search, req?.userId ?? users, clients);
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR"])
  @Get('legends')
  async getLegends(@Res() res: Response) {
    const shift = await this.shiftService.getShiftLegends();
    return res.status(200).json(shift);
  }

  @Roles(["ADMIN","HR"])
  @Get(':shiftId')
  async getOne(@Param('shiftId') id: string, @Res() res: Response) {
    const shift = await this.shiftService.getOne(id);
    return res.status(200).json(shift);
  }


  @Roles(["ADMIN","HR"])
  @Get()
  async getAll(@Req() req: Request, @Res() res: Response) {
    const shifts = await this.shiftService.getAll();
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR"])
  @Post('swapShift')
  async swapShift(@Req() req: Request | any, @Res() res: Response, @Body() body: SwapShifts) {
    const shifts = await this.shiftService.swapShift(body);
    res.status(201).json(shifts);
    await this.logs.LOG(req.user, 'Shifts Swapped', LogType.Update, body, 
    null, [shifts?.shift_id],"SHIFT","swapped"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('assignShift')
  async assignShift(@Req() req: Request | any, @Res() res: Response, @Body() body: AssignShiftsByCode) {
    const shifts = await this.shiftService.assignShiftByCode(body);
    res.status(201).json(shifts);
    await this.logs.LOG(req.user, 'Shifts Assigned', LogType.Update, body, 
    null, [shifts?.shift_id],"SHIFT","assigned"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('resolveConflict')
  async resolveConflict(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: SwitchShifts,
  ) {
    const shifts = await this.shiftService.resolveConflict(body);
    res.status(201).json(shifts);
    await this.logs.LOG(req.user, 'Shifts Conflict Resolved', LogType.Update, body,
    null, body?.shift_id ,"SHIFT","resolved conflict"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Req() req: Request | any, @Res() res: Response, @Body() body: DeleteShift) {
    const shift = await this.shiftService.delete(body);
    res.status(201).json(shift);
    await this.logs.LOG(req.user, 'Shift Deleted', LogType.Delete, body,
    null, body?.shifts , "SHIFT" , "deleted" 
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post()
  async create(@Req() req: Request | any, @Res() res: Response, @Body() body: CreateShift) {
    const shift = await this.shiftService.create(body);
    res.status(201).json(shift);
    await this.logs.LOG(req.user, 'Shift Created', LogType.Create, body,
    null, Array.isArray(shift) ? shift?.map((e)=>(e?.shift_id)) : shift?.shift_id,'SHIFT',"created"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Put(':shiftId')
  async update(
    @Param('shiftId') id: string,
    @Body() body: UpdateShift,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const shift = await this.shiftService.update(id, body);
    res.status(200).json(shift);
    await this.logs.LOG(req.user, 'Shift Updated', LogType.Update, body,
    null, id , 'SHIFT' , "updated" , {...body}
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Delete()
  async deleteOne(
    @Param('shiftId') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const shift = await this.shiftService.deleteAll();
    res.status(200).json(shift);
    await this.logs.LOG(req.user, 'Shift Created', LogType.Delete, { deleted_id: id },
    null , id , "SHIFT" , "deleted"
    );
    return;
  }
}
