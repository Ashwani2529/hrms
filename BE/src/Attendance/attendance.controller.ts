import {
  Body,
  Controller,
  Delete,
  Query,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Request, Response } from 'express';
import {
  CreateAttendance,
  DeleteAttendance,
  UpdateAttendance,
} from './dto/attendance.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('attendance')
@ApiBearerAuth()
@ApiTags('Attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('withinfo')
  async getAllWithInfo(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('status') status: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const attendance = await this.attendanceService.getAllWithInfo(
      search,
      startDate,
      endDate,
      status,
      page,
      limit,
      req?.userId ?? null,
    );

    return res.status(200).json(attendance);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get(':id')
  async getSingle(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const attendance = await this.attendanceService.getOne(id, req?.userId ?? null);
    return res.status(200).json(attendance);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('user/:userid')
  async getUserAttendence(
    @Param('userid') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const attendance = await this.attendanceService.getUserAttendence(
      startDate,
      endDate,
      id,
      req?.userId ?? null,
    );
    return res.status(200).json(attendance);
  }

  @Roles(['ADMIN', 'HR'])
  @Get()
  async getAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('status') status: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    console.log(page, limit);
    const attendance = await this.attendanceService.getAll(
      search,
      startDate,
      endDate,
      status,
      page,
      limit,
    );
    return res.status(200).json(attendance);
  }

  @Post('autoAttendance/:id')
  async createauto(@Res() res: Response, @Param('id') shiftId: string) {
    const attendance = await this.attendanceService.autoAttendance(shiftId);
    return res.status(201).json(attendance);
  }

  @Roles(['ADMIN', 'HR'])
  @Post('delete')
  async delete(
    @Body() body: DeleteAttendance,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const attendance = await this.attendanceService.delete(body);
    res.status(201).json(attendance);
    await this.logs.LOG(
      req.user,
      'Attendance deleted',
      LogType.Delete,
      body,
      null, body?.attendances , 'ATTENDANCE' , "deleted"
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post()
  async create(
    @Body() body: CreateAttendance,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    try {
      const attendance = await this.attendanceService.create(body);
      res.status(201).json(attendance);
      await this.logs.LOG(
        req.user,
        'Attendance created Manually',
        LogType.Create,
        body,
        null, attendance?.attendance_id , 'ATTENDANCE', "created"
      );
      return;
    } catch (error) {
      console.log(error)
    }
  }

  @Roles(['ADMIN', 'HR'])
  @Put(':id')
  async update(
    @Body() body: UpdateAttendance,
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('id') attendanceId: string,
  ) {
    const attendance = await this.attendanceService.update(attendanceId, body);
    res.status(201).json(attendance);
    await this.logs.LOG(
      req.user,
      'Attendance updated',
      LogType.Update,
      {
        attendanceId,
        body,
      },
      null, attendanceId , "ATTENDANCE" , "updated" , body
    );
    return;
  }
}
