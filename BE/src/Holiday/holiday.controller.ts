import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { Request, Response } from 'express';
import { CreateHoliday, DeleteHoliday, UpdateHoliday } from './dto/holiday.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('holiday')
@ApiBearerAuth()
@ApiTags('Holiday')
export class HolidayController {
  constructor(
    private readonly holidayService: HolidayService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR"])
  @Get('/withinfo')
  async getHolidayWithInfo(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.holidayService.getHolidayWithInfo(
      search,
      startDate,
      endDate,
      type,
      page,
      limit
    );
    return res.status(200).send(result);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get(':id')
  async getHolidayById(@Req() req: Request | any, @Res() res: Response) {
    const result = await this.holidayService.getHolidayById(req.params.id,req?.userId ?? null);
    return res.status(200).send(result);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get()
  async getHoliday(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const result = await this.holidayService.getHoliday(
      search,
      startDate,
      endDate,
      type,
      page,
      limit,
      req?.userId ?? null     // for emp only
    );

    return res.status(200).send(result);
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async deleteHoliday(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: DeleteHoliday,
  ) {
    const result = await this.holidayService.deleteHoliday(body);
    res.status(201).send(result);
    await this.logs.LOG(req.user, 'Holiday deleted', LogType.Delete, body,
    null , body?.id , 'HOLIDAY' , "deleted"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post()
  async createHoliday(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: CreateHoliday,
  ) {
    const result = await this.holidayService.createHoliday(body);
    res.status(201).send(result);
    await this.logs.LOG(req.user, 'Holiday created', LogType.Create, body,
    null, result?.holiday_id , 'HOLIDAY' , "created"
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Put(':id')
  async updateHoliday(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: UpdateHoliday,
  ) {
    const result = await this.holidayService.updateHoliday(req.params.id, req.body);
    res.status(200).send(result);
    await this.logs.LOG(req.user, 'Holiday updated', LogType.Update, body,
    null , req.params.id , 'HOLIDAY' , "updated" , body
    );
    return;
  }
}
