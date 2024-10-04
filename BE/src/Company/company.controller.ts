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
import { CompanyService } from './company.service';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { CreateCompany, UpdateCompany } from './dto/company.dto';

@Controller('company')
@ApiBearerAuth()
@ApiTags('Company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN"])
  @Get('withinfo')
  async getAllWithInfo(@Req() req: Request, @Res() res: Response) {
    const companies = await this.companyService.getAllWithInfo();
    return res.status(200).json(companies);
  }

  @Roles(["ADMIN"])
  @Get()
  async getAll(@Req() req: Request, @Res() res: Response) {
    const companies = await this.companyService.getAll();
    return res.status(200).json(companies);
  }

  @Roles(["ADMIN"])
  @Get(':companyId')
  async getOne(@Param('companyId') id: string, @Res() res: Response) {
    const company = await this.companyService.getOne(id);
    return res.status(200).json(company);
  }

  @Roles(["ADMIN"])
  @Get('history/:companyId')
  async getHistory(@Param('companyId') id: string, @Res() res: Response) {
    const company = await this.companyService.getHistory(id);
    return res.status(200).json(company);
  }

  @Roles(["ADMIN"])
  @Post()
  async create(@Body() data: CreateCompany, @Req() req: Request, @Res() res: Response) {
    const company = await this.companyService.create(data);
    res.status(201).json(company);
    // await this.logs.LOG(req.user, `Company created`, LogType.Create, company);
    return;
  }

  @Roles(["ADMIN"])
  @Put(':companyId')
  async update(
    @Param('companyId') id: string,
    @Body() data: UpdateCompany,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const company = await this.companyService.update(id, data);
    res.status(200).json(company);
    // await this.logs.LOG(req.user, `Company updated`, LogType.Update, company);
    return;
  }
}
