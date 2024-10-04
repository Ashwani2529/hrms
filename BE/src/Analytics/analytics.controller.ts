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
import { AnalyticsService } from './analytics.service';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('analytics')
@ApiBearerAuth()
@ApiTags('Analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  
  @Roles(["ADMIN"])
  @Get('clientReport/:clientId')
  async clientReport(
    @Param('clientId') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.analyticsService.clientReport(id);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR"])
  @Get('getAttendance')
  async getAttendance(
    @Req() req: Request,
    @Res() res: Response,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const result = await this.analyticsService.getAttendance(startDate, endDate);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN"])
  @Get('live_report')
  async live_report(@Req() req: Request, @Res() res: Response) {
    const result = await this.analyticsService.live_report();
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get('live_employee_info')
  async live_employee(@Req() req: Request | any, @Res() res: Response) {
    const result = await this.analyticsService.live_employee_info(req.userId ?? null);
    return res.status(200).json(result);
  }
}
