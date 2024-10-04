import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetLoggerQ } from './dto/logger.dto';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('logger')
@ApiBearerAuth()
@ApiTags('Logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Roles(["ADMIN"])
  @Get()
  async getAll(
    @Res() res: Response,
    @Query() { search, startDate, endDate, logType, page, limit }: GetLoggerQ,
    // @Query('search') search: string = '',
    // @Query('startDate') startDate: string | Date,
    // @Query('endDate') endDate: string | Date,
    // @Query('logType') logType: string,
    // @Query('page') page: string,
    // @Query('limit') limit: string,
  ) {
    const logs = await this.loggerService.getAll(
      search,
      startDate,
      endDate,
      logType,
      page,
      limit,
    );
    return res.status(200).json(logs);
  }
}
