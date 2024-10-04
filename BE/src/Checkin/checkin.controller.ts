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
import { CheckinService } from './checkin.service';
import { Request, Response } from 'express';
import {
  CheckinDelete,
  CreateAutomateCheckIn,
  CreateManualCheckIn,
  UpdateCheckIn,
} from './dto/checkin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('checkin')
@ApiBearerAuth()
@ApiTags('Checkin')
export class CheckinController {
  constructor(
    private readonly checkinService: CheckinService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR","EMP"])
  @Get('withinfo')
  async findWithInfo(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.checkinService.findWithInfo(
      search,
      startDate,
      endDate,
      type,
      page,
      limit,
      req?.userId ?? null
    );
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get(':checkinId')
  async findOne(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('checkinId') id: string,
  ) {
    const result = await this.checkinService.findOne(id,req?.userId ?? null);     // for emp only);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get()
  async findAll(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('type') type: string = '',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.checkinService.findAll(
      search,
      startDate,
      endDate,
      type,
      page,
      limit,
      req?.userId ?? null
    );
    return res.status(200).json(result);
  }

  // @Roles(["ADMIN","HR"])
  @Post('autoCheckin')
  async createAutoCheckin(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: CreateAutomateCheckIn,
  ) {
    let result: any;
    if (body.log_type === 'IN') {
      result = await this.checkinService.createCheckIn(body);
    } else if (body.log_type === 'OUT') {
      result = await this.checkinService.createCheckOut(body);
    } else {
      res.status(400).json({ message: 'Invalid log type' });
      await this.logs.LOG(req.user, 'Checkin creation failed', LogType.Create, body,
      `${req.user?.name} Failed Checkin Creation of type ${body.log_type} at ${body?.log_time}, for user ${body?.user_id}`);
      return;
    }
    res.status(201).json(result);
    // await this.logs.LOG(
    //   req?.user,
    //   'Checkin created',
    //   LogType.Create,
    //   body,
    //   `${req.user?.name} Created Auto Checkin of type ${body.log_type} at ${body?.log_time}, for user ${body?.user_id} & shift ${result?.shift_id}`
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Req() req: Request | any, @Res() res: Response, @Body() body: CheckinDelete) {
    const result = await this.checkinService.delete(body);
    res.status(201).json(result);
    await this.logs.LOG(req.user, 'Checkin deleted', LogType.Delete, body, `${req.user?.name} Deleted Checkins, with ids ${body?.checkins} `);
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post()
  async create(
    @Req() req: Request | any,
    @Body() body: CreateManualCheckIn,
    @Res() res: Response,
  ) {
    const result = await this.checkinService.create(body);
    res.status(201).json(result);
    await this.logs.LOG(req.user, 'Checkin created', LogType.Create, body , 
    `${req.user?.name} Created Manual Checkin of type ${body.log_type} at ${body?.log_time}, for user ${body?.user_id} & shift ${body?.shift_id}`);
    return;
  }

  @Roles(["ADMIN","HR"])
  @Put(':checkinId')
  async update(
    @Req() req: Request | any,
    @Body() body: UpdateCheckIn,
    @Res() res: Response,
    @Param('checkinId') id: string,
  ) {
    const result = await this.checkinService.update(id, body);
    res.status(200).json(result);
    await this.logs.LOG(req.user, 'Checkin updated', LogType.Update, body,
    `${req.user?.name} Updated Checkin ${id}`
    );
    return;
  }
}
