import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
} from 'class-validator';
import {
  Prisma,
  PAYROLL_STATUS,
  PAYROLL_FREQUENCY,
  PAID_STATUS,
  SALARY_SLIP_APPROVAL,
  SALARY_TYPE,
  SalarySlip,
  User,
  Company,
} from '@prisma/client';

export class CreateSalary {
  @IsNotEmpty()
  @IsNumber()
  base_salary_amount: number;

  @IsNotEmpty()
  @IsNumber()
  ot_hours_amount: number;

  @IsNotEmpty()
  @IsString()
  currency_type: string;

  @IsOptional()
  @IsDateString()
  from_date: string | Date;

  @IsOptional()
  @IsNumber()
  paid_leave_encashment: number;

  @IsOptional()
  @IsArray()
  earnings?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  incentive?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  deduction?: Prisma.JsonObject[];
}
export class UpdateSalary {
  @IsNotEmpty()
  @IsNumber()
  base_salary_amount: number;

  @IsNotEmpty()
  @IsString()
  currency_type: string;

  @IsOptional()
  @IsNumber()
  paid_leave_encashment: number;

  @IsOptional()
  @IsArray()
  earnings?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  incentive?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  deduction?: Prisma.JsonObject[];
}

export class UpdatePayroll {
  @IsOptional()
  @IsEnum(PAYROLL_STATUS)
  payroll_status: PAYROLL_STATUS;

  @IsOptional()
  @IsDateString()
  payroll_start_date: string | Date;

  @IsOptional()
  @IsEnum(PAYROLL_FREQUENCY)
  payroll_frequency: PAYROLL_FREQUENCY;
}

export class CreateBonus {
  @IsNotEmpty()
  @IsEnum(PAID_STATUS)
  bonus_status: PAID_STATUS;

  @IsNotEmpty()
  @IsDateString()
  bonus_date: string | Date;

  @IsNotEmpty()
  @IsString()
  bonus_type: string;

  @IsNotEmpty()
  @IsNumber()
  bonus_amount: number;

  @IsNotEmpty()
  @IsString()
  currency_type: string;
}

export class UpdateBonus {
  @IsOptional()
  @IsEnum(PAID_STATUS)
  bonus_status: PAID_STATUS;

  @IsOptional()
  @IsDateString()
  bonus_date: string | Date;

  @IsOptional()
  @IsString()
  bonus_type: string;

  @IsOptional()
  @IsNumber()
  bonus_amount: number;

  @IsOptional()
  @IsString()
  currency_type: string;
}

export class UpdateSalarySlip {
  @IsDateString()
  salary_slip_from_date?: Date | string;

  @IsOptional()
  @IsDateString()
  salary_slip_to_date?: Date | string;

  @IsOptional()
  @IsString()
  currency_type?: string;

  @IsOptional()
  @IsNumber()
  paid_leave_encashment?: number;

  @IsOptional()
  @IsNumber()
  leave_days?: number;

  @IsOptional()
  @IsNumber()
  working_days?: number;

  @IsOptional()
  @IsNumber()
  base_salary?: number;

  @IsOptional()
  @IsNumber()
  salary_slip_total_earning?: number;

  @IsOptional()
  @IsNumber()
  salary_slip_total_incentive?: number;

  @IsOptional()
  @IsNumber()
  salary_slip_total_deduction?: number;

  @IsOptional()
  @IsNumber()
  salary_slip_total_amount?: number;

  @IsOptional()
  @IsArray()
  earnings?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  incentive?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  deduction?: Prisma.JsonObject[];

  @IsOptional()
  @IsArray()
  bonuses?: Prisma.JsonObject[];
}

export class DeleteSalary {
  @IsNotEmpty()
  @IsArray()
  salaries: string[];

  @IsNotEmpty()
  @IsDateString()
  end_date: string | Date;
}

export class DeleteBonus {
  @IsNotEmpty()
  @IsArray()
  bonuses: string[];
}

export class GenerateSalarySlips {
  @IsNotEmpty()
  @IsArray()
  payrollIds: string[];
}

export class DeleteSalarySlip {
  @IsNotEmpty()
  @IsArray()
  salary_slips: string[];
}

export class SalarySlipPdf {
  companyName: string;
  companyAddress: string;

  employeeName: string;
  employeeEmail: string;
  employeeId: string;
  employeePosition: string;
  employeeJoiningDate: string;

  employeeAccountNumber: string;

  employeeUan: string;
  employeePfAccountNumber: string;

  employeePaidDays: number;
  employeeLopDays: number;

  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  incentives: { name: string; amount: number }[];

  calculatedEarnings: number;
  calculatedIncentives: number;
  calculatedDeductions: number;
  calculatedNetIncome: number;

  start_date: Date | string;
  end_date: Date | string;

  constructor(salarySlip: SalarySlip, user: any) {
    this.companyName = user.company.company_name;
    this.companyAddress = user.company.company_address;

    this.employeeEmail = user.user_email;
    this.employeeId = user.user_id;
    this.employeeJoiningDate = user.date_of_joining;

    this.employeeName = user.user_name || 'N/A';
    this.employeePosition = user.employment_type || 'Employee';
    this.employeeAccountNumber = user.user_bank.account_number || 'N/A';
    this.employeeUan = user.user_bank.universal_account_number || 'N/A';
    this.employeePfAccountNumber = user.user_bank.pf_account_number || 'N/A';

    this.employeePaidDays = salarySlip.working_days;
    this.employeeLopDays = salarySlip.leave_days;

    this.start_date = salarySlip.salary_slip_from_date;
    this.end_date = salarySlip.salary_slip_to_date;
    this.calculatedEarnings = salarySlip.salary_slip_total_earning;
    this.calculatedIncentives = salarySlip.salary_slip_total_incentive;
    this.calculatedDeductions = salarySlip.salary_slip_total_deduction;
    this.calculatedNetIncome = salarySlip.salary_slip_total_amount;

    this.earnings = [];
    this.deductions = [];
    this.incentives = [];

    for (let i = 0; i < salarySlip.earnings.length; i++) {
      let ear: any = salarySlip.earnings[i];
      this.earnings.push({
        name: ear.name,
        amount: ear.amount,
      });
    }

    for (let i = 0; i < salarySlip.deduction.length; i++) {
      let ded: any = salarySlip.deduction[i];
      this.deductions.push({
        name: ded.name,
        amount: ded.amount,
      });
    }

    for (let i = 0; i < salarySlip.incentive.length; i++) {
      let inc: any = salarySlip.incentive[i];
      this.incentives.push({
        name: inc.name,
        amount: inc.amount,
      });
    }
  }
}

export class GenerateSampleExcel {
  @IsNotEmpty()
  @IsArray()
  payrollIds: string[];
}

export class BulkSalaryUpdate {
  @IsNotEmpty()
  buffer: Buffer;
}
