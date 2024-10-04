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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { Request, Response } from 'express';
import {
  CreateBonus,
  CreateSalary,
  DeleteBonus,
  DeleteSalary,
  DeleteSalarySlip,
  GenerateSalarySlips,
  GenerateSampleExcel,
  UpdateBonus,
  UpdatePayroll,
  UpdateSalary,
  // UpdateSalary,
  UpdateSalarySlip,
} from './dto/payroll.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import fs, { unlinkSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('payroll')
@ApiBearerAuth()
@ApiTags('Payroll')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('/salaryAllSlip/:payrollId')
  async getAllSalarySlip(
    @Param('payrollId') id: string,
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('startDate') startDate: string | Date,
    @Query('endDate') endDate: string | Date,
    @Query('status') status: string,
    @Query('approval') approval: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const user = await this.payrollService.getAllSalarySlip(
      id,
      startDate,
      endDate,
      status,
      approval,
      page,
      limit,
      req?.userId ?? null, // for emp only
    );
    return res.status(200).json(user);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('/salaryAllSlips')
  async salaryAllSlips(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('approval') approval: string,
    @Query('endDate') endDate?: string,
    @Query('startDate') startDate?: string,
    
    
  ) {
    const allSlips = await this.payrollService.salaryAllSlips(
     page,
      limit,
      search,
      status,
      approval,
      endDate,
      startDate,
    );
    return res.status(200).json(allSlips);
  }

  @Roles(['ADMIN', 'HR'])
  @Get('generateSalarySlip/:payrollId')
  async generateSalarySlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
    @Query('incentive') incentive: number,
  ) {
    const salarySlip = await this.payrollService.generateSalarySlip(
      payrollId,
      incentive,
    );
    res.status(200).json(salarySlip);
    // await this.logs.LOG(
    //   req.user,
    //   'Generated Salary Slip',
    //   LogType.Create,
    //   { payrollId },
    //   `${req.user?.name} Generated Salary slip from payroll id ${payrollId}`,
    // );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('generateMultipleSalarySlip')
  async generateSalarySlips(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: GenerateSalarySlips,
  ) {
    const salarySlip = await this.payrollService.generateMultipleSalarySlip(body);
    res.status(200).json(salarySlip);
    await this.logs.LOG(
      req.user,
      'Generated Multiple Salary Slip',
      LogType.Create,
      body,
      `${req.user?.name} Generated Multiple Salary slips from payroll ids ${body.payrollIds}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Get('generateAllSalarySlips')
  async generateAllSalarySlips(@Req() req: Request | any, @Res() res: Response) {
    const salarySlip = await this.payrollService.generateAllSalarySlips();
    res.status(200).json(salarySlip);
    await this.logs.LOG(
      req.user,
      'Generated All Active Salary Slips',
      LogType.Create,
      {},
      `${req.user?.name} Generated All Active Payroll's Salary slips`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('downloadSalarySlip/:salary_slip_id')
  async downloadSalarySlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('salary_slip_id') salary_slip_id: string,
  ) {
    const salarySlip = await this.payrollService.downloadSalarySlipPDF(
      salary_slip_id,
      req?.userId ?? null,
    ); // for emp only);
    return res.status(200).json(salarySlip);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('salarySlip/:salary_slip_id')
  async getSalarySlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('salary_slip_id') salary_slip_id: string,
  ) {
    const salarySlip = await this.payrollService.getSalarySlip(
      salary_slip_id,
      req?.userId ?? null,
    ); // for emp only);
    return res.status(200).json(salarySlip);
  }

  @Roles(['ADMIN', 'HR'])
  @Get('withInfo')
  async getPayrollWithInfo(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
  ) {
    const payroll = await this.payrollService.getPayrollWithInfo(
      search,
      page,
      limit,
      status,
    );
    return res.status(200).json(payroll);
  }

  @Roles(['ADMIN', 'HR'])
  @Get(':payrollId')
  async getPayrollById(
    @Req() req: Request,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
  ) {
    const payroll = await this.payrollService.getPayrollById(payrollId);
    return res.status(200).json(payroll);
  }

  @Roles(['ADMIN', 'HR'])
  @Get('userPayroll/:userId')
  async getUserPayroll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('userId') userId: string,
  ) {
    const payrollData = await this.payrollService.getPayrollInfoByUserId(userId);
    return res.status(200).json(payrollData);
  }

  @Roles(['ADMIN', 'HR'])
  @Get()
  async getPayroll(
    @Req() req: Request,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
  ) {
    const payroll = await this.payrollService.getPayroll(search, page, limit, status);
    return res.status(200).json(payroll);
  }

  @Roles(['ADMIN', 'HR'])
  @Post('createSalary/:payrollId')
  async createSalary(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
    @Body() body: CreateSalary,
  ) {
    const salary = await this.payrollService.createSalary(payrollId, body);
    res.status(200).json(salary);
    await this.logs.LOG(
      req.user,
      'Created Salary',
      LogType.Create,
      {
        payrollId,
        body,
      },
      `${req.user?.name} Create Salary for payroll id ${payrollId}, from date ${body.from_date}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put('updateSalary/:salaryId')
  async updateSalary(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('salaryId') salaryId: string,
    @Body() body: UpdateSalary,
  ) {
    const salary = await this.payrollService.updateSalary(salaryId, body);
    res.status(200).json(salary);
    await this.logs.LOG(
      req.user,
      'Updated Salary',
      LogType.Create,
      {
        salaryId,
        body,
      },
      `${req.user?.name} Updated Salary for id ${salaryId}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('createBonus/:payrollId')
  async createBonus(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
    @Body() body: CreateBonus,
  ) {
    const bonus = await this.payrollService.createBonus(payrollId, body);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Created Bonus',
      LogType.Create,
      { payrollId, body },
      `${req.user?.name} Create Bonus for payroll id ${payrollId}, dated ${body.bonus_date} , type ${body.bonus_type}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put('approveSalarySlip/:salary_slip_id')
  async approveSalarySlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('salary_slip_id') salary_slip_id: string,
  ) {
    const bonus = await this.payrollService.approveSalarySlip(salary_slip_id);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Approved Salary Slip',
      LogType.Update,
      {
        salary_slip_id,
      },
      `${req.user?.name} Approved Salary Slip with id ${salary_slip_id}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put(':payrollId')
  async updatePayroll(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
    @Body() body: UpdatePayroll,
  ) {
    const payroll = await this.payrollService.updatePayroll(payrollId, body);
    res.status(200).json(payroll);
    await this.logs.LOG(
      req.user,
      'Updated Payroll',
      LogType.Update,
      {
        payrollId,
        body,
      },
      `${req.user?.name} Updated Payroll with id ${payrollId}, dated ${body.payroll_start_date} & status ${body.payroll_status}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('getAllSalaryStructure/:payrollId')
  async getAllSalaryStructure(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('payrollId') payrollId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const salary = await this.payrollService.getSalaryStructure(
      payrollId,
      page,
      limit,
      startDate,
      endDate,
      req?.userId ?? null,
    );
    res.status(200).json(salary);
  }

  @Roles(['ADMIN', 'HR', 'EMP'])
  @Get('getSalaryStructure/:salaryId')
  async getSalaryStructureWithId(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('salaryId') salaryId: string,
  ) {
    const salary = await this.payrollService.getSalaryStructureById(
      salaryId,
      req?.userId ?? null,
    );
    res.status(200).json(salary);
  }

  @Roles(['ADMIN', 'HR'])
  @Put('updateBonus/:bonusId')
  async updateBonus(
    @Req() req: Request | any,
    @Res() res: Response,
    @Param('bonusId') bonusId: string,
    @Body() body: UpdateBonus,
  ) {
    const bonus = await this.payrollService.updateBonus(bonusId, body);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Updated Bonus',
      LogType.Update,
      { bonusId, body },
      `${req.user?.name} Updated Bonus with id ${bonusId}, dated ${body.bonus_date} & status ${body.bonus_status}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Put('salarySlip')
  async updateSalarySlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: UpdateSalarySlip,
    @Query('salary_slip_id') salary_slip_id: string,
  ) {
    const bonus = await this.payrollService.updateSalarySlip(salary_slip_id, body);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Updated Salary Slip',
      LogType.Update,
      {
        salary_slip_id,
        body,
      },
      `${req.user?.name} Updated Salary Slip with id ${salary_slip_id}, from date ${body.salary_slip_from_date} - to date ${body.salary_slip_to_date}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('deleteSalary')
  async deleteSalary(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: DeleteSalary,
  ) {
    const salary = await this.payrollService.deleteSalary(body);
    res.status(200).json(salary);
    await this.logs.LOG(
      req.user,
      'Deleted Salary',
      LogType.Delete,
      body,
      `${req.user?.name} Deleted Salaries with ids ${body.salaries}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('deleteBonus')
  async deleteBonus(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: DeleteBonus,
  ) {
    const bonus = await this.payrollService.deleteBonus(body);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Deleted Bonus',
      LogType.Delete,
      body,
      `${req.user?.name} Deleted Bonuses with ids ${body.bonuses}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('deleteSalarySlip')
  async deleteSalarSlip(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: DeleteSalarySlip,
  ) {
    const bonus = await this.payrollService.deleteSalarySlip(body);
    res.status(200).json(bonus);
    await this.logs.LOG(
      req.user,
      'Deleted Salary Slip',
      LogType.Delete,
      body,
      `${req.user?.name} Deleted Salary Slips with ids ${body.salary_slips}`,
    );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('generateSampleExcel')
  async generateSampleExcel(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: GenerateSampleExcel,
  ) {
    await this.payrollService.generateSampleExcel(body);

    // Send the file to the frontend
    res.download('./data.xlsx', 'bulk-salary-sample.xlsx', err => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        // Delete the temporary file after download completes
        unlinkSync('./data.xlsx');
      }
    });

    await this.logs.LOG(
      req.user,
      'Bulk Salary Sample Generated',
      LogType.Create,
      null,
      `${req.user?.name} generated salary sample for bulk update`,
    );

    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('bulk-salary-update')
  @UseInterceptors(FileInterceptor('file'))
  async bulkSalaryUpdate(
    @UploadedFile() file: any,
    @Res() res: Response,
    @Req() req: Request | any,
  ) {
    const result = await this.payrollService.bulkSalaryUpdate(file);
    res.status(201).json(result);
    await this.logs.LOG(
      req.user,
      'Bulk Salary Updated',
      LogType.Create,
      null,
      `${req.user?.name} updated salary in bulk with file upload`,
    );
    return;
  }
}
