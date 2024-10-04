import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { RequestService } from './requests.service';
import { CreateRequest, DeleteRequests, UpdateRequests } from './dto/requests.dto';

@Controller('requests')
@ApiBearerAuth()
@ApiTags('requests')
export class RequestsController {
  constructor(
    private readonly requestService: RequestService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('/all')
  async getAllUserRequests(
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
    const requests = await this.requestService.getAllUserRequests(
      search,
      startDate,
      endDate,
      type,
      status,
      page,
      limit,
      req?.userId ?? null,
    ); // for emp only
    return res.status(200).json(requests);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get(':id')
  async getRequests(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const requests = await this.requestService.getRequests(id, req?.userId ?? null); // for emp only
    return res.status(200).json(requests);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Post()
  async create(
    @Body() body: CreateRequest,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.requestService.create(body);
    res.status(201).json(request);
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('delete')
  async delete(
    @Body() body: DeleteRequests,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.requestService.delete(body);
    res.status(201).json(request);
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put(':id')
  async update(
    @Param('id') requestId: string,
    @Body() body: UpdateRequests,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.requestService.update(requestId, body);
    res.status(200).json(request);
    return;
  }
}
