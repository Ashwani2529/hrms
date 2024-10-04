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
} from '@nestjs/common';
import { PflagService } from './pflag.service';
import { Request, Response } from 'express';
import { CreatePflag, PflagDelete, UpdatePflag } from './dto/pflag.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('pflag')
@ApiBearerAuth()
@ApiTags('Permission Flag')
export class PflagController {
  constructor(
    private readonly pflagService: PflagService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN"])
  @Get('withinfo')
  async getAllRoles(@Req() req: Request, @Res() res: Response) {
    const pflags = await this.pflagService.getAllRoles();
    return res.status(200).json(pflags);
  }

  @Roles(["ADMIN"])
  @Get()
  async getAll(@Req() req: Request, @Res() res: Response) {
    const pflags = await this.pflagService.getAll();
    return res.status(200).json(pflags);
  }

  @Roles(["ADMIN"])
  @Get(':pflagId')
  async getOne(@Param('pflagId') id: string, @Res() res: Response) {
    const pflag = await this.pflagService.getOne(id);
    return res.status(200).json(pflag);
  }

  @Roles(["ADMIN"])
  @Post('delete')
  async delete(@Body() body: PflagDelete, @Req() req: Request | any, @Res() res: Response) {
    const pflag = await this.pflagService.delete(body);
    res.status(201).json(pflag);
    await this.logs.LOG(req.user, 'Deleted pflags', LogType.Delete, body,
    `${req.user?.name} Deleted Permission with ids ${body.pflags}`
    );
    return;
  }

  @Roles(["ADMIN"])
  @Post()
  async create(@Body() body: CreatePflag, @Req() req: Request | any, @Res() res: Response) {
    const pflag = await this.pflagService.create(body);
    res.status(201).json(pflag);
    await this.logs.LOG(req.user, 'Created pflags', LogType.Create, body,
    `${req.user?.name} Created Permission with name ${body.name}`
    );
    return;
  }

  @Roles(["ADMIN"])
  @Put(':pflagId')
  async update(
    @Param('pflagId') id: string,
    @Body() body: UpdatePflag,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const pflag = await this.pflagService.update(id, body);
    res.status(200).json(pflag);
    await this.logs.LOG(req.user, 'Updated pflags', LogType.Update, { id, body },
    `${req.user?.name} Updated Permission with name ${body.name}`
    );
    return;
  }
}
