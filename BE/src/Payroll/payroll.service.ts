import { PrismaService } from 'src/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import {
  BulkSalaryUpdate,
  CreateBonus,
  CreateSalary,
  DeleteBonus,
  DeleteSalary,
  DeleteSalarySlip,
  GenerateSalarySlips,
  GenerateSampleExcel,
  SalarySlipPdf,
  UpdateBonus,
  UpdatePayroll,
  UpdateSalary,
  UpdateSalarySlip,
} from './dto/payroll.dto';
import { Attendance, SalarySlip, SalaryStructure } from '@prisma/client';
import { calculateAdditionals } from 'src/Config/common';
import { generatePdf } from 'src/Config/pdfGenerate';
import { emailConfig } from 'src/Config/emailConfig';
import * as ExcelJS from 'exceljs';
import { NotificationGateway } from 'src/Notification/gateway/notification.gateway';
import { Console } from 'console';

@Injectable()
export class PayrollService {
  constructor(
    private notiGate: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async getPayrollById(payrolId: string): Promise<any> {
    try {
      const payroll = await this.prisma.payroll.findUnique({
        where: { payroll_id: payrolId },
        include: {
          user: {
            select: {
              user_id: true,
              user_name: true,
              user_email: true,
              profile_photo: true,
            },
          },
          bonus: true,
        },
      });
      if (!payroll) {
        throw new NotFoundException('Payroll not found');
      }

      const salary = await this.prisma.salaryStructure.findMany({
        where: { payroll_id: payrolId },
        orderBy: [{ from_date: 'desc' }, { end_date: 'desc' }],
      });

      const finalpayroll = { ...payroll, salary: salary[0] };
      return finalpayroll;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
  async getPayrollInfoByUserId(userId: string): Promise<any> {
    try {
      const payrollData = await this.prisma.payroll.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              user_id: true,
              user_name: true,
              user_email: true,
              profile_photo: true,
              role: true,
            },
          },
          bonus: true,
        },
      });
      if (!payrollData) {
        throw new NotFoundException('Payroll not found');
      }
      for (const pay of payrollData) {
        let salary = await this.prisma.salaryStructure.findMany({
          where: { payroll_id: pay.payroll_id },
          orderBy: [{ from_date: 'desc' }, { end_date: 'desc' }],
        });
        if (salary.length > 0) {
          (pay as any).salary = salary[0];
          let paySlip = await this.prisma.salarySlip.findMany({
            where: { payroll_id: pay.payroll_id, salary_id: salary[0].salary_id },
          });
          (pay as any).paySlip = paySlip[0];
        }
        
      }
      return payrollData[0];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
  async salaryAllSlips(
    page: string,
    limit: string,
    search: string,
    status: string,
    approval: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    try {
      const query: any = {};
      let where: any = {};

      if (search) {
        where.OR = [
          {
            payroll: {
              user: {
                user_name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            payroll: {
              user: {
                user_email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ];
      }

      if (status) {
        where.salary_slip_status = status;
      }

      if (approval) {
        where.salary_slip_approval = approval;
      }

      if (startDate && endDate) {
        where = {
          ...where,
          AND: [
            {
              from_date: {
                gte: moment(startDate).toDate(),
              },
            },
            {
              end_date: {
                lte: moment(endDate).toDate(),
              },
            },
          ],
        };
      } else if (startDate) {
        where.from_date = {
          gte: moment(startDate).toDate(),
        };
      } else if (endDate) {
        where.end_date = {
          lte: moment(endDate).toDate(),
        };
      }

      query.where = where;

      query.include = {
        payroll: {
          include: {
            user: true,
          },
        },
      };
      const totalSalaryStructures = await this.prisma.salaryStructure.count({ where });

      if (page && limit) {
        query.skip = (parseInt(page) - 1) * parseInt(limit);
      }

      if (limit) {
        query.take = parseInt(limit);
      }

      const salaryStructures: SalaryStructure[] =
        await this.prisma.salaryStructure.findMany({
          ...query,
          include: {
            payroll: {
              include: {
                user: true,
              },
            },
          },
        });
      const getSalaryStructureDetails = async () => {
        let salaryStructureDetails = await Promise.all(
          salaryStructures.map(async structure => {
            const payroll = await this.prisma.payroll.findFirst({
              where: { payroll_id: structure.payroll_id },
            });
            const user = await this.prisma.user.findFirst({
              where: { user_id: payroll.user_id },
            });
            const slips = await this.prisma.salarySlip.findFirst({
              where: { payroll_id: structure.payroll_id },
            });

            // Helper function to sum the amounts from an array
            const sumAmounts = arr =>
              arr.reduce((total, item) => total + (item.amount || 0), 0);

            // Calculate the gross earnings (including base salary, incentives, earnings, and paid leave encashment)
            const totalEarnings =
              structure.base_salary_amount +
              structure.paid_leave_encashment +
              sumAmounts(structure.ot_hours_amount ? [structure.ot_hours_amount] : []) +
              sumAmounts(structure.incentive || []) +
              sumAmounts(structure.earnings || []);

            // Calculate total deductions
            const totalDeductions = sumAmounts(structure.deduction || []);

            // Calculate the net pay (gross earnings - total deductions)
            const netPay = totalEarnings - totalDeductions;

            return {
              employee: user,
              payroll: payroll,
              slips: slips,
              startDate: structure.from_date,
              endDate: structure.end_date || 'N/A',
              workingDays: slips?.working_days || 0, // Assuming you have this field in salarySlip
              leaves: slips?.leave_days || 0, // Assuming you have this field in salarySlip
              baseSalary: structure.base_salary_amount,
              paidLeaveEncashment: structure.paid_leave_encashment || 0,
              incentives: sumAmounts(structure.incentive || []),
              earnings: sumAmounts(structure.earnings || []),
              deduction: totalDeductions,
              grossPay: totalEarnings, // Total earnings (including base, incentives, paid leave, etc.)
              netPay: netPay, // Total earnings minus deductions
            };
          }),
        );

        return salaryStructureDetails;
      };
      const salaryStructureDetails = await getSalaryStructureDetails();
      return {
        totalSalaryStructures: salaryStructures.length,
        salaryStructureDetails,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occurred');
    }
  }

  async getPayrollWithInfo(
    search: string,
    page: string,
    limit: string,
    status: string,
  ): Promise<any> {
    try {
      const query: any = {
        include: {
          user: true,
          salary: true,
          bonus: true,
          salary_slip: true,
        },
      };

      const where: any = {
        user: { status: 'Active' },
        OR: [
          {
            user: {
              user_name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              user_email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      };
      query.where = where;

      if (status) where.payroll_status = status;
      const totalPayrolls = await this.prisma.payroll.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const payroll: any = await this.prisma.payroll.findMany(query);

      for (let index = 0; index < payroll.length; index++) {
        const element = payroll[index];
        const salary = await this.prisma.salaryStructure.findMany({
          where: { payroll_id: element.payroll_id },
          orderBy: [{ from_date: 'desc' }, { end_date: 'desc' }],
        });
        payroll[index].salary = salary[0];
      }
      return {
        totalPayrolls,
        payroll,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getSalaryStructure(
    payrollId: string,
    page: string,
    limit: string,
    startDate?: string,
    endDate?: string,
    userId?: string,
  ): Promise<any> {
    try {
      const payroll = await this.prisma.payroll.findFirst({
        where: { payroll_id: payrollId },
      });

      if (!payroll) {
        throw new ConflictException('Payroll Not found');
      }

      if (userId) {
        if (payroll.user_id !== userId) {
          throw new ForbiddenException('You are not allowed to access');
        }
      }

      const query: any = {};

      let where: any = { payroll_id: payrollId };

      if (startDate && endDate) {
        where = {
          ...where,
          OR: [
            {
              AND: [
                { from_date: { gte: moment(startDate, 'YYYY-MM-DD').toDate() } },
                { from_date: { lte: moment(endDate, 'YYYY-MM-DD').toDate() } },
              ],
            },
            {
              AND: [
                { end_date: { gte: moment(startDate, 'YYYY-MM-DD').toDate() } },
                { end_date: { lte: moment(endDate, 'YYYY-MM-DD').toDate() } },
              ],
            },
            {
              AND: [
                { from_date: { lte: moment(startDate, 'YYYY-MM-DD').toDate() } },
                { end_date: { gte: moment(endDate, 'YYYY-MM-DD').toDate() } },
              ],
            },
          ],
        };
      } else if (startDate) {
        where = {
          ...where,
          OR: [
            { from_date: { gte: moment(startDate).toDate() } },
            { end_date: { gte: moment(startDate).toDate() } },
          ],
        };
      } else if (endDate) {
        where = {
          ...where,
          OR: [
            { from_date: { gte: moment(startDate).toDate() } },
            { end_date: { gte: moment(startDate).toDate() } },
          ],
        };
      }

      query.where = where;

      const totalSalaryStructure = await this.prisma.salaryStructure.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const salaryStructure = await this.prisma.salaryStructure.findMany(query);

      return { totalSalaryStructure, salaryStructure };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getSalaryStructureById(salaryId: string, user_id?: string): Promise<any> {
    try {
      const salary = await this.prisma.salaryStructure.findUnique({
        where: { salary_id: salaryId },
        include: {
          payroll: {
            select: {
              user_id: true,
            },
          },
        },
      });

      if (user_id) {
        if (salary?.payroll?.user_id !== user_id) {
          throw new ForbiddenException('You are not allowed to access');
        }
      }

      if (!salary) {
        throw new ConflictException('Salary Not found');
      }

      return salary;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getPayroll(
    search: string,
    page: string,
    limit: string,
    status: string,
  ): Promise<any> {
    try {
      const query: any = {};

      const where: any = {
        OR: [
          {
            user: {
              user_name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            user: {
              user_email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      };

      query.where = where;

      if (status) where.payroll_status = status;

      const totalPayrolls = await this.prisma.payroll.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const payroll: any = await this.prisma.payroll.findMany(query);
      return {
        totalPayrolls,
        payroll,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createSalary(payrollId: string, data: CreateSalary): Promise<any> {
    try {
      const payroll = await this.prisma.payroll.findUnique({
        where: { payroll_id: payrollId },
      });

      if (!payroll || payroll.payroll_status === 'Inactive') {
        throw new ConflictException('Payroll is inactive');
      }

      const recentSalary = await this.prisma.salaryStructure.findMany({
        where: { payroll_id: payrollId },
      });

      if (recentSalary?.length > 0) {
        // only update the end date -----------------------------
        await this.prisma.handlePrismaError(
          this.prisma.salaryStructure.update({
            where: { salary_id: recentSalary[recentSalary?.length - 1]?.salary_id },
            data: {
              end_date: moment(data?.from_date).subtract(1, 'days').toDate(),
            },
          }),
        );
      }

      const createSalary = await this.prisma.handlePrismaError(
        this.prisma.salaryStructure.create({
          data: {
            payroll_id: payrollId,
            ...data,
          },
        }),
      );

      if (!createSalary) {
        throw new ConflictException('Salary not created');
      }

      await this.notiGate.handlesSendNotification({
        title: 'Salary Structure Renewed',
        description: 'Your Salary Slip has been renewed',
        notification_type: 'Payroll',
        notification_status: 'Pending',
        roles: null,
        userId: [payroll?.user_id],
      });

      return createSalary;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createBonus(payrollId: string, data: CreateBonus): Promise<any> {
    try {
      const createBonus = await this.prisma.handlePrismaError(
        this.prisma.bonus.create({
          data: {
            payroll_id: payrollId,
            ...data,
          },
        }),
      );

      if (!createBonus) {
        throw new ConflictException('Bonus not created');
      }

      return createBonus;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async updatePayroll(payrollId: string, data: UpdatePayroll): Promise<any> {
    try {
      const updatePayroll = await this.prisma.handlePrismaError(
        this.prisma.payroll.update({
          where: { payroll_id: payrollId },
          data: {
            ...data,
          },
        }),
      );

      if (!updatePayroll) {
        throw new ConflictException('Payroll not updated');
      }

      return updatePayroll;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async updateSalary(salaryId: string, data: UpdateSalary): Promise<any> {
    try {
      const salary = await this.prisma.salaryStructure.findUnique({
        where: { salary_id: salaryId },
        include: {
          payroll: true,
        },
      });

      if (!salary) {
        throw new ConflictException('Salary not found');
      }

      if (salary?.generated_salary_slip) {
        throw new ConflictException(
          'Salary Slip already generated, Cannot update now.',
        );
      }
      // Clean the data: remove undefined and irrelevant properties
      const cleanedData = { ...data };
      // Update the salary structure and payroll dynamically
      const updateSalary = await this.prisma.handlePrismaError(
        this.prisma.salaryStructure.update({
          where: { salary_id: salaryId },
          data: {
            base_salary_amount: cleanedData.base_salary_amount,
            currency_type: cleanedData.currency_type,
            paid_leave_encashment: cleanedData.paid_leave_encashment,
            earnings: cleanedData.earnings,
            incentive: cleanedData.incentive,
            deduction: cleanedData.deduction,
          },
        }),
      );

      await this.notiGate.handlesSendNotification({
        title: 'Salary Structure Updated',
        description: 'Your Salary Slip has been renewed',
        notification_type: 'Payroll',
        notification_status: 'Pending',
        roles: null,
        userId: [salary?.payroll?.user_id],
      });

      return updateSalary;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error?.message || 'Some error occured in creating salary',
      );
    }
  }

  async updateBonus(bonusId: string, data: UpdateBonus): Promise<any> {
    try {
      const updateBonus = await this.prisma.handlePrismaError(
        this.prisma.bonus.update({
          where: { bonus_id: bonusId },
          data: {
            ...data,
          },
        }),
      );

      if (!updateBonus) {
        throw new ConflictException('Bonus not updated');
      }

      return updateBonus;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteSalary(data: DeleteSalary): Promise<any> {
    try {
      const deleteSalary = await this.prisma.handlePrismaError(
        this.prisma.salaryStructure.updateMany({
          where: {
            salary_id: { in: data.salaries },
          },
          data: {
            end_date: data?.end_date,
          },
        }),
      );

      if (deleteSalary.count === 0) {
        throw new NotFoundException('No client found');
      }
      return { message: 'Salary deleted', deletedSalaries: data };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteBonus(data: DeleteBonus): Promise<any> {
    try {
      const deleteBonus = await this.prisma.handlePrismaError(
        this.prisma.bonus.deleteMany({
          where: {
            bonus_id: { in: data.bonuses },
          },
        }),
      );

      if (deleteBonus.count === 0) {
        throw new ConflictException('Bonus not deleted');
      }
      return { message: 'Bonus deleted', deletedBonuses: data };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllSalarySlip(
    payrollId: string,
    startDate: string | Date,
    endDate: string | Date,
    status: string,
    approval: string,
    page: string,
    limit: string,
    userId: string,
  ): Promise<any> {
    try {
      const query: any = {
        orderBy: {
          salary_slip_from_date: 'desc',
        },
        include: {
          payroll: {
            select: {
              user: true,
            },
          },
        },
      };

      let where: any = {};

      if (payrollId !== 'all') {
        where.payroll_id = payrollId;
      }

      if (userId) {
        const check = await this.prisma.payroll.findFirst({
          where: { user_id: userId },
        });

        if (check?.payroll_id !== payrollId) {
          throw new ForbiddenException('You are not allowed');
        }
      }

      if (status) where.salary_slip_status = status;
      if (approval) where.salary_slip_approval = approval;

      if (startDate && endDate) {
        where = {
          ...where,
          AND: [
            {
              salary_slip_from_date: {
                gte: moment(startDate).toDate(),
              },
            },
            {
              salary_slip_to_date: {
                lte: moment(endDate).toDate(),
              },
            },
          ],
        };
      } else if (startDate) {
        where.salary_slip_from_date = {
          gte: moment(startDate).toDate(),
        };
      } else if (endDate) {
        where.salary_slip_to_date = {
          lte: moment(endDate).toDate(),
        };
      }

      query.where = where;

      const totalSalarySlips = await this.prisma.salarySlip.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const salarySlip: any = await this.prisma.salarySlip.findMany(query);

      return {
        totalSalarySlips,
        salarySlip,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getSalarySlip(salary_slip_id: string, userId: string): Promise<any> {
    try {
      const salarySlip = await this.prisma.salarySlip.findUnique({
        where: { salary_slip_id: salary_slip_id },
        include: {
          payroll: {
            include: {
              user: {
                select: {
                  user_id: true,
                  user_name: true,
                  user_email: true,
                },
              },
            },
          },
        },
      });

      if (userId) {
        const check = await this.prisma.payroll.findFirst({
          where: { user_id: userId },
        });

        if (check?.payroll_id !== salarySlip.payroll_id) {
          throw new ForbiddenException('You are not allowed');
        }
      }

      if (!salarySlip) {
        throw new NotFoundException('Salary Slip not found');
      }
      return salarySlip;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async generateSalarySlip(payrollId: string, incentive?: number): Promise<any> {
    try {
      const payroll = await this.prisma.payroll.findUnique({
        where: { payroll_id: payrollId },
        include: {
          salary: true,
          bonus: true,
          user: {
            select: {
              user_id: true,
              user_name: true,
              user_email: true,
              company_id: true,
            },
          },
        },
      });

      if (!payroll) {
        throw new NotFoundException('Payroll not found');
      }

      const companyData = await this.prisma.companyData.findMany({
        where: { company_id: payroll.user.company_id },
        orderBy: [{ from_date: 'desc' }, { end_date: 'desc' }],
      });

      // check for last APPROVED salry slip genrated to find the date from which we need to generate the salry slips
      const lastSalarySlip = await this.prisma.salarySlip.findMany({
        where: {
          payroll_id: payrollId,
          salary_slip_approval: 'Approved',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // check if salary could be generated or not according to the saalary frequency -----------------
      // find the date till which we need to calculate the payroll ------
      const lastSalaryDate = lastSalarySlip[0]
        ? lastSalarySlip[0]?.salary_slip_to_date
        : payroll?.payroll_start_date;

      const today = moment();
      let salaryTillDate: moment.Moment = moment();

      switch (payroll?.payroll_frequency) {
        case 'Monthly':
          // checking the pay date of last month ---------
          if (today.date() !== companyData[0]?.payment_day_of_month) {
            const pastDate = today.clone().date(companyData[0]?.payment_day_of_month);
            while (pastDate.isAfter(today)) {
              pastDate.subtract(1, 'months');
            }
            salaryTillDate = pastDate;
          }

          // if (
          //   moment(salaryTillDate).diff(lastSalaryDate, 'days') + 1 <
          //   companyData[0]?.payment_day_of_month
          // ) {
          //   throw new ConflictException(
          //     `Payroll Frequency is Monthly, total days to be paid is ${moment(salaryTillDate).diff(lastSalaryDate, 'days')} till ${salaryTillDate.toDate()}`,
          //   );
          // }
          break;

        case 'Weekly':
          const lastSunday = today.clone().day(-7);
          salaryTillDate = lastSunday;

          // if (moment(lastSunday).diff(lastSalaryDate, 'days') < 7) {
          //   throw new ConflictException(
          //     `Payroll Frequency is Weekly, total days to be paid is ${moment(lastSunday).diff(lastSalaryDate, 'days')} till ${lastSunday.toDate()}`,
          //   );
          // }
          break;

        default:
          break;
      }

      // save all the changed salary structure histories between the last salry structure and now
      let salary: SalaryStructure[] = null;

      if (lastSalarySlip?.length > 0) {
        // get all salary stricture to calculate salary from lastsalaryslip date till Today --------------
        salary = await this.prisma.salaryStructure.findMany({
          where: {
            payroll_id: payrollId,
            OR: [
              {
                AND: [
                  {
                    from_date: {
                      gte: moment(lastSalaryDate).toDate(),
                    },
                  },
                  { from_date: { lte: salaryTillDate.toDate() } },
                ],
              },
              {
                AND: [
                  {
                    end_date: {
                      gte: moment(
                        lastSalarySlip[lastSalarySlip?.length - 1]?.salary_slip_to_date,
                      ).toDate(),
                    },
                  },
                  { end_date: { lte: salaryTillDate.toDate() } },
                ],
              },
              {
                AND: [
                  {
                    from_date: {
                      lte: moment(
                        lastSalarySlip[lastSalarySlip?.length - 1]?.salary_slip_to_date,
                      ).toDate(),
                    },
                  },
                  { end_date: { gte: salaryTillDate.toDate() } },
                ],
              },
            ],
          },
          orderBy: [{ from_date: 'asc' }, { end_date: 'asc' }],
        });
      } else {
        // if no previos salary slip then check for all last salary structures --------------
        salary = await this.prisma.salaryStructure.findMany({
          where: {
            payroll_id: payrollId,
            OR: [
              { from_date: { gte: moment(lastSalaryDate).toDate() } },
              { end_date: { lte: salaryTillDate.toDate() } },
            ],
          },
          orderBy: [{ from_date: 'asc' }, { end_date: 'asc' }],
        });
      }
      const salarySlips = []; // save all the salary slips created at end

      // For multiple salary structure, multiple salary slips would be generated
      for (let i = 0; i < salary.length; i++) {
        const salaryData = salary[i];
        // for inital salary the current date is last salary slip end date
        let currentDate =
          i === 0
            ? (lastSalarySlip[lastSalarySlip?.length - 1]?.salary_slip_to_date ??
              salaryData?.from_date)
            : salaryData?.from_date; // current date is the start date of salary structure

        // end date is the last date till which the salaries would be calculated
        const endDate = salaryData?.end_date
          ? salaryTillDate.toDate() > new Date(salaryData?.end_date)
            ? salaryData?.end_date
            : salaryTillDate.toDate()
          : salaryTillDate.toDate();

        // attendace marked between current and end date
        const attendance = await this.prisma.attendance.findMany({
          where: {
            user_id: payroll.user.user_id,
            attendance_date: {
              gte: moment(currentDate).toDate(),
              lte: moment(endDate).toDate(),
            },
          },
        });

        // getting base amount for salary ---------
        let baseAmount = null;
        switch (payroll?.payroll_frequency) {
          case 'Hourly':
            baseAmount = salaryData?.base_salary_amount;
            break;

          case 'Monthly':
            baseAmount =
              salaryData?.base_salary_amount / companyData[0]?.standard_monthly_days;
            break;

          case 'Weekly':
            baseAmount = salaryData?.base_salary_amount / 7;
            break;

          case 'Daily':
            baseAmount = salaryData?.base_salary_amount;
            break;

          default:
            break;
        }

        let calculated_unpaid_leave_days = 0;
        let calculated_paid_leave_days = 0;
        let calculated_holidays = 0;
        let calculated_working_days = 0; // hours in case of hourly ---------------
        let calculated_overtime_hours = 0;
        let calculated_overtime_compunsatory_days = 0;
        let extra_overtime_compunsatory_hours = 0;
        const company_history_ids = []; // all the history ids storing ---------------

        // check for attendance cases and genrates the values of leaves, holidays and ot hors
        for (let i = 0; i < attendance.length; i++) {
          const attend: Attendance = attendance[i];

          // calculating days and hours --------
          if (['SICK', 'EARNED', 'CASUAL', 'COMPUNSATORY'].includes(attend.status)) {
            calculated_paid_leave_days += 1;
          } else if (['HOLIDAY', 'WEEKOFF'].includes(attend.status)) {
            calculated_holidays += 1;
          } else if (attend.status === 'HALF_DAY') {
            if (payroll?.payroll_frequency === 'Hourly') {
              calculated_working_days += attend?.attendance_hours;
            } else {
              calculated_working_days += 0.5;
            }

            if (attend?.ot_hours) {
              calculated_overtime_hours += attend?.ot_hours;
            }
          } else if (attend.status === 'PRESENT') {
            if (payroll?.payroll_frequency === 'Hourly') {
              calculated_working_days += attend?.attendance_hours;
            } else {
              calculated_working_days += 1;
            }

            if (attend?.ot_hours) {
              calculated_overtime_hours += attend?.ot_hours;
            }
          } else if (attend.status === 'OVER_TIME') {
            calculated_overtime_hours += attend?.ot_hours;
          } else if (['ABSENT', 'UNPAID'].includes(attend.status)) {
            calculated_unpaid_leave_days += 1;
          }
        }

        // checking for ot-hours and converting it to pay or compensatory leave -------
        if (calculated_overtime_hours > 0) {
          calculated_overtime_hours = 0;

          const company_data_history = await this.prisma.companyData.findMany({
            where: {
              OR: [
                {
                  AND: [
                    {
                      from_date: {
                        gte: moment(currentDate).toDate(),
                      },
                    },
                    { from_date: { lte: moment(endDate).toDate() } },
                  ],
                },
                {
                  AND: [
                    {
                      end_date: {
                        gte: moment(currentDate).toDate(),
                      },
                    },
                    { end_date: { lte: moment(endDate).toDate() } },
                  ],
                },
                {
                  AND: [
                    {
                      from_date: {
                        lte: moment(currentDate).toDate(),
                      },
                    },
                    { end_date: { gte: moment(endDate).toDate() } },
                  ],
                },
              ],
            },
            orderBy: [
              {
                from_date: 'asc',
              },
            ],
          });

          // traversing all the data history for ot_hours conversion
          for (let index = 0; index < company_data_history.length; index++) {
            const element = company_data_history[index];
            company_history_ids.push(element?.companydata_id);

            const start_ot_date = index === 0 ? currentDate : element.from_date;
            const end_ot_date =
              index === company_data_history?.length - 1 ? endDate : element?.end_date;

            // calculating the total ot in the duration current-date to comapany-data_history_date
            const ot_attendance = await this.prisma.attendance.aggregate({
              _sum: {
                ot_hours: true,
              },
              where: {
                user_id: payroll?.user_id,
                attendance_date: {
                  gte: moment(start_ot_date).toDate(),
                  lte: moment(end_ot_date).toDate(),
                },
                ot_hours: {
                  not: null,
                },
              },
            });

            if (element?.ot_pay_type === 'COMPUNSATORY_OFF') {
              calculated_overtime_compunsatory_days += Math.floor(
                ot_attendance._sum?.ot_hours / element?.standarized_shift_hours,
              );
              extra_overtime_compunsatory_hours +=
                ot_attendance._sum?.ot_hours % element?.standarized_shift_hours;
            } else {
              calculated_overtime_hours += ot_attendance._sum?.ot_hours;
            }
          }

          if (calculated_overtime_hours > 0) {
            // adding the pay ot hours in earnings
            salaryData.earnings.push({
              name: 'Overtime',
              type: 'NORMAL',
              amount: salaryData?.ot_hours_amount * calculated_overtime_hours,
            });
          }
        }

        salaryData.earnings.push({
          name: 'Basic Salary',
          type: 'NORMAL',
          amount: calculated_working_days * parseFloat(baseAmount.toFixed(2)),
        });

        salaryData.earnings.push({
          name: 'Paid Leaves',
          type: 'NORMAL',
          amount: calculated_paid_leave_days * parseFloat(baseAmount.toFixed(2)),
        });

        salaryData.earnings.push({
          name: 'Holidays',
          type: 'NORMAL',
          amount: calculated_holidays * parseFloat(baseAmount.toFixed(2)),
        });

        // if extra incentive is given -----
        if (incentive) {
          salaryData.incentive.push({
            name: 'Extra Bonus',
            type: 'NORMAL',
            amount: incentive,
          });
        }

        const calculated_earnings = await calculateAdditionals(
          salaryData?.earnings as any,
          salaryData?.base_salary_amount,
        );

        const calculated_incentive = await calculateAdditionals(
          salaryData?.incentive as any,
          calculated_earnings,
        );

        const calculated_deduction = await calculateAdditionals(
          salaryData?.deduction as any,
          calculated_earnings,
        );

        const salarySlip: SalarySlip = await this.prisma.handlePrismaError(
          this.prisma.salarySlip.create({
            data: {
              payroll_id: payrollId,
              salary_id: salaryData?.salary_id,
              company_history_id: company_history_ids,
              salary_slip_approval: 'Pending',
              salary_slip_status: 'Pending',
              salary_slip_from_date: currentDate,
              salary_slip_to_date: endDate,
              salary_slip_freq: payroll?.payroll_frequency,
              working_days: calculated_working_days,
              ot_hours: calculated_overtime_hours,
              paid_leave_days: calculated_paid_leave_days,
              leave_days: calculated_unpaid_leave_days,
              holidays: calculated_holidays,
              base_salary: salaryData?.base_salary_amount,
              incentive: salaryData?.incentive,
              earnings: salaryData?.earnings,
              deduction: salaryData?.deduction,
              bonuses: payroll.bonus,
              currency_type: salaryData?.currency_type,
              salary_slip_total_incentive: calculated_incentive,
              salary_slip_total_deduction: calculated_deduction,
              salary_slip_total_earning: calculated_earnings,
              salary_slip_total_amount:
                calculated_incentive + calculated_earnings - calculated_deduction,
              complementary_leaves_days: calculated_overtime_compunsatory_days,
              extra_complementary_leave_hours: extra_overtime_compunsatory_hours,
            },
          }),
        );

        if (!salarySlip) {
          throw new ConflictException('Conflict in creating salary slip');
        }
        salarySlips.push(salarySlip);

        if (salarySlip?.salary_slip_approval === 'Pending') {
          await this.notiGate.handlesSendNotification({
            title: 'Salary Slip Pending',
            description: 'Your Salary Slip is Generated and is in Pending Status',
            notification_type: 'Payroll',
            notification_status: 'Pending',
            roles: null,
            userId: [payroll.user_id],
          });
        }

        currentDate = salaryData?.from_date;
      }
      return salarySlips;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async generateMultipleSalarySlip(payrollId: GenerateSalarySlips): Promise<any> {
    try {
      return Promise.all(
        payrollId.payrollIds.map(async (payroll: any) => {
          await this.generateSalarySlip(payroll);
        }),
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async generateAllSalarySlips(): Promise<any> {
    try {
      const payrollIds = await this.prisma.payroll.findMany({
        where: { payroll_status: 'Active' },
        select: { payroll_id: true },
      });

      return Promise.all(
        payrollIds?.map(async (payroll: any) => {
          await this.generateSalarySlip(payroll.payroll_id);
        }),
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async downloadSalarySlipPDF(salary_slip_id: string, userId: string): Promise<any> {
    try {
      const salarySlip = await this.prisma.salarySlip.findUnique({
        where: { salary_slip_id: salary_slip_id },
        include: {
          payroll: {
            include: {
              user: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      if (userId) {
        const check = await this.prisma.payroll.findFirst({
          where: { user_id: userId },
        });

        if (check?.payroll_id !== salarySlip.payroll_id) {
          throw new ForbiddenException('You are not allowed');
        }
      }

      if (!salarySlip) {
        throw new NotFoundException('Salary Slip not found');
      }

      const buffer = await generatePdf(
        new SalarySlipPdf(salarySlip, salarySlip.payroll.user),
      );

      return buffer;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async sendSalarySlipPDFEmail(body: SalarySlipPdf, receiver: string) {
    try {
      const buffer = await generatePdf(body);

      const options = {
        from: 'Heliverse',
        subject: 'test',
        to: receiver,
        attachments: [
          {
            filename: buffer.pdfFileName,
            content: buffer.pdfContent,
          },
        ],
      };

      const transporter: any = await emailConfig();
      await transporter.sendMail(options);

      return { message: 'Salary Slip sent to your email' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async approveSalarySlip(salary_slip_id: string): Promise<any> {
    try {
      const salarySlip = await this.prisma.salarySlip.findUnique({
        where: { salary_slip_id: salary_slip_id },
        include: {
          payroll: {
            include: {
              user: {
                include: {
                  company: true,
                },
              },
            },
          },
        },
      });

      if (!salarySlip) {
        throw new ConflictException('Salary Slip not found');
      }

      await this.prisma.handlePrismaError(
        this.prisma.salarySlip.update({
          where: { salary_slip_id: salary_slip_id },
          data: {
            salary_slip_approval: 'Approved',
            complementary_leaves: {
              create: {
                no_of_leaves: salarySlip?.complementary_leaves_days,
                remaining_extra_hours: salarySlip?.extra_complementary_leave_hours,
                expired_At: moment(new Date())
                  .add(6 * 30 * 24 * 3600, 'seconds')
                  .toDate(),
                user_id: salarySlip?.payroll?.user_id,
              },
            },
          },
        }),
      );

      // update salary structure status -----------------------
      if (salarySlip?.salary_id) {
        const salary = await this.prisma.salaryStructure.findUnique({
          where: { salary_id: salarySlip?.salary_id },
        });

        if (
          moment(salary?.end_date, 'YYYY-MM-DD') <=
          moment(salarySlip?.salary_slip_to_date, 'YYYY-MM-DD')
        ) {
          await this.prisma.handlePrismaError(
            this.prisma.salaryStructure.update({
              where: { salary_id: salarySlip?.salary_id },
              data: {
                generated_salary_slip: true,
              },
            }),
          );
        }
      }

      if (!salarySlip) {
        throw new ConflictException('Salary Slip not approved');
      }

      await this.sendSalarySlipPDFEmail(
        new SalarySlipPdf(salarySlip, salarySlip?.payroll.user),
        salarySlip?.payroll.user.user_email,
      );

      if (salarySlip?.salary_slip_approval === 'Approved') {
        await this.notiGate.handlesSendNotification({
          title: 'Salary Slip Approved',
          description: 'Your Salary Slip is Approved',
          notification_type: 'Payroll',
          notification_status: 'Pending',
          roles: null,
          userId: [salarySlip?.payroll.user_id],
        });
      }

      return salarySlip;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async updateSalarySlip(salary_slip_id: string, data: UpdateSalarySlip): Promise<any> {
    try {
      const updateSalarySlip = await this.prisma.handlePrismaError(
        this.prisma.salarySlip.update({
          where: {
            salary_slip_id: salary_slip_id,
          },
          data: {
            ...data,
          },
        }),
      );

      if (!updateSalarySlip) {
        throw new ConflictException('Salary Slip not updated');
      }
      return updateSalarySlip;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteSalarySlip(data: DeleteSalarySlip): Promise<any> {
    try {
      const deleteSalarySlip = await this.prisma.handlePrismaError(
        this.prisma.salarySlip.deleteMany({
          where: {
            salary_slip_id: { in: data.salary_slips },
          },
        }),
      );

      if (deleteSalarySlip.count === 0) {
        throw new NotFoundException('No Salary Slip found');
      }
      return { message: 'Salary Slip deleted', deletedSalarySlips: data };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async generateSampleExcel(data: GenerateSampleExcel): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');
    sheet.columns = [
      { header: 'Payroll Id', key: 'payroll_id' },
      { header: 'Employee Name', key: 'emp_name' },
      { header: 'Base Salary', key: 'base_salary_amount' },
      { header: 'Currency Type', key: 'currency_type' },
      { header: 'From Date', key: 'from_date' },
      { header: 'To Date', key: 'end_date' },
      { header: 'Unpaid Leave Encashment', key: 'paid_leave_encashment' },
      { header: 'Earning Name', key: 'earning_name' },
      { header: 'Earning Type', key: 'earning_type' },
      { header: 'Earning Amount', key: 'earning_amount' },
      { header: 'Incentive Name', key: 'incentive_name' },
      { header: 'Incentive Type', key: 'incentive_type' },
      { header: 'Incentive Amount', key: 'incentive_amount' },
      { header: 'Deduction Name', key: 'deduction_name' },
      { header: 'Deduction Type', key: 'deduction_type' },
      { header: 'Deduction Amount', key: 'deduction_amount' },
    ];

    const promises = data.payrollIds?.map(id => {
      return new Promise(async (res, rej) => {
        try {
          const salaryStructure = await this.prisma.salaryStructure.findFirst({
            where: { payroll_id: id },
            include: {
              payroll: {
                select: {
                  user: {
                    select: {
                      user_name: true,
                    },
                  },
                },
              },
            },
          });

          if (salaryStructure) {
            let dataArr: any = [];

            salaryStructure?.earnings.forEach((e: any, index) => {
              dataArr[index] = { ...dataArr[index], earning: e };
            });

            salaryStructure?.deduction.forEach((e: any, index) => {
              dataArr[index] = { ...dataArr[index], deduction: e };
            });

            salaryStructure?.incentive.forEach((e: any, index) => {
              dataArr[index] = { ...dataArr[index], incentive: e };
            });

            dataArr?.forEach(e => {
              sheet.addRow({
                ...salaryStructure,
                from_date: salaryStructure?.from_date,
                end_date: salaryStructure?.end_date,
                earning_name: e['earning']?.name,
                earning_type: e['earning']?.type,
                earning_amount: e['earning']?.amount,
                incentive_name: e['incentive']?.name,
                incentive_type: e['incentive']?.type,
                incentive_amount: e['incentive']?.amount,
                deduction_name: e['deduction']?.name,
                deduction_type: e['deduction']?.type,
                deduction_amount: e['deduction']?.amount,
                emp_name: salaryStructure?.payroll.user.user_name,
              });
            });
          } else {
            const payroll = await this.prisma.payroll.findUnique({
              where: { payroll_id: id },
              include: { user: true },
            });

            sheet.addRow({
              payroll_id: id,
              emp_name: payroll.user.user_name,
            });
          }

          res(true);
        } catch (error) {
          console.log(error);
          rej(false);
          throw new BadRequestException('Error generating sample file');
        }
      });
    });

    await Promise.all(promises);

    // Save the workbook to a local file
    const filePath = './data.xlsx';
    await workbook.xlsx.writeFile(filePath);

    return { message: 'Salary Sample generated' };
  }

  async bulkSalaryUpdate(data: BulkSalaryUpdate): Promise<any> {
    try {
      if (!data) {
        throw new BadRequestException('Excel file is required');
      }

      const columnIds = [
        'payroll_id',
        'emp_name',
        'base_salary_amount',
        'currency_type',
        'from_date',
        'end_date',
        'paid_leave_encashment',
        'earning_name',
        'earning_type',
        'earning_amount',
        'incentive_name',
        'incentive_type',
        'incentive_amount',
        'deduction_name',
        'deduction_type',
        'deduction_amount',
      ];

      const buffer = Buffer.from(data.buffer as ArrayBuffer);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);

      const finalData = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          // Skip the header row
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            // Map the header to the corresponding column ID
            rowData[columnIds[colNumber - 1]] = cell.value;
          });

          if (!rowData.payroll_id) {
            throw new BadRequestException('Data is not valid');
          }

          let index = finalData?.findIndex(e => e?.payroll_id === rowData.payroll_id);

          if (index === -1) {
            finalData?.push({ ...rowData, earnings: [], incentive: [], deduction: [] });
            index = finalData?.length - 1;
          }

          if (
            rowData?.incentive_name &&
            rowData?.incentive_type &&
            rowData?.incentive_amount
          ) {
            finalData[index]?.incentive?.push({
              name: rowData?.incentive_name,
              type: rowData?.incentive_type,
              amount: rowData?.incentive_amount,
            });
          }

          if (
            rowData?.earning_name &&
            rowData?.earning_type &&
            rowData?.earning_amount
          ) {
            finalData[index]?.earnings?.push({
              name: rowData?.earning_name,
              type: rowData?.earning_type,
              amount: rowData?.earning_amount,
            });
          }

          if (
            rowData?.deduction_name &&
            rowData?.deduction_type &&
            rowData?.deduction_amount
          ) {
            finalData[index]?.deduction?.push({
              name: rowData?.deduction_name,
              type: rowData?.deduction_type,
              amount: rowData?.deduction_amount,
            });
          }
        }
      });

      const payrollIds: string[] = finalData?.map(salaryData => {
        return salaryData?.payroll_id;
      });
      await finalData.map(async salaryData => {
        let sal = await this.prisma.salaryStructure.findFirst({
          where: { payroll_id: salaryData?.payroll_id },
          select: { salary_id: true },
        });

        if (sal) {
          await this.updateSalary(sal.salary_id, salaryData);
        }
      });
      await this.generateMultipleSalarySlip({ payrollIds });

      return { message: `Mutliple salary slips generated` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(`Failed to bulk update salary ${error}`);
      }
    }
  }
}
