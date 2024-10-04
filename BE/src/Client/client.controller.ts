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
import { ClientService } from './client.service';
import { Request, Response } from 'express';
import {
  ChangeClient,
  CreateClient,
  DeleteClient,
  UpdateClient,
} from './dto/client.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('client')
@ApiBearerAuth()
@ApiTags('Client')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN","HR"])
  @Get('/getAllClientShifts')
  async getAllClientShifts(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
  ) {
    const shifts = await this.clientService.getAllClientShifts(search);
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR"])
  @Get('/withinfo')
  async findAllWithInfo(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.clientService.findAllWithInfo(search, page, limit);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR"])
  @Get()
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.clientService.findAll(search, page, limit);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR"])
  @Get(':clientId')
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('clientId') id: string,
  ) {
    const result = await this.clientService.findOne(id);
    return res.status(200).json(result);
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async delete(@Req() req: Request, @Res() res: Response, @Body() body: DeleteClient) {
    const result = await this.clientService.delete(body);
    res.status(201).json(result);
    await this.logs.LOG(req.user, 'Client deleted', LogType.Delete, body);
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('/changeClient')
  async changeClient(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ChangeClient,
  ) {
    const result = await this.clientService.changeClient(body);
    res.status(201).json(result);
    await this.logs.LOG(req.user, 'Client changed', LogType.Update, body);
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post()
  async create(@Req() req: Request, @Res() res: Response, @Body() body: CreateClient) {
    const result = await this.clientService.create(body);
    res.status(201).json(result);
    await this.logs.LOG(req.user, 'Client created', LogType.Create, body);
    return;
  }

  @Roles(["ADMIN","HR"])
  @Put(':clientId')
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('clientId') id: string,
    @Body() body: UpdateClient,
  ) {
    const result = await this.clientService.update(id, body);
    res.status(200).json(result);
    await this.logs.LOG(req.user, 'Client updated', LogType.Update, body);
    return;
  }
}
