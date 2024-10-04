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
import { TicketsService } from './tickets.service';
import { CreateTicket, DeleteTickets, UpdateTickets } from './dto/tickets.dto';

@Controller('tickets')
@ApiBearerAuth()
@ApiTags('tickets')
export class TicketsController {
  constructor(
    private readonly ticketService: TicketsService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('/all')
  async getAllUserTickets(
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
    const requests = await this.ticketService.getAllUserTickets(
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
  async getTickets(
    @Param('id') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const requests = await this.ticketService.getTickets(id, req?.userId ?? null); // for emp only
    return res.status(200).json(requests);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Post()
  async create(
    @Body() body: CreateTicket,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.ticketService.create(body);
    res.status(201).json(request);
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('delete')
  async delete(
    @Body() body: DeleteTickets,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.ticketService.delete(body);
    res.status(201).json(request);
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put(':id')
  async update(
    @Param('id') requestId: string,
    @Body() body: UpdateTickets,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const request = await this.ticketService.update(requestId, body);
    res.status(200).json(request);
    return;
  }
}
