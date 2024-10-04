import { PrismaService } from 'src/prisma.service';
import { Company } from '@prisma/client';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCompany, UpdateCompany } from './dto/company.dto';
import { setEnvValue } from 'src/Config/common';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Company[]> {
    try {
      return await this.prisma.company.findMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllWithInfo(): Promise<Company[]> {
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          users: true,
        },
      });
      return companies;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string): Promise<any> {
    try {
      const company = await this.prisma.company.findUnique({
        where: {
          company_id: id,
        },
        include: {
          users: true,
        },
      });

      const company_data_history = await this.prisma.companyData.findMany({
        where: { company_id: id },
        orderBy: {
          end_date: 'desc',
        },
        select: {
          ot_pay_type: true,
          standarized_shift_hours: true,
          from_date: true,
          end_date: true,
          min_half_day_hours: true,
          payment_day_of_month: true,
          salary_freq: true,
          standard_monthly_days: true,
        },
      });

      return { ...company, company_data: company_data_history[0] };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getHistory(id: string): Promise<any> {
    try {
      const company_data_history = await this.prisma.companyData.findMany({
        where: { company_id: id },
        orderBy: {
          end_date: 'desc',
        },
        select: {
          ot_pay_type: true,
          standarized_shift_hours: true,
          from_date: true,
          end_date: true,
          min_half_day_hours: true,
          salary_freq: true,
          standard_monthly_days: true,
        },
      });

      return company_data_history;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateCompany): Promise<Company> {
    try {
      const history_data = {
        standarized_shift_hours: data?.standarized_shift_hours,
        ot_pay_type: data?.ot_pay_type,
        min_half_day_hours: data?.min_half_day_hours,
        standard_monthly_days: data?.standard_monthly_days,
        salary_freq: data?.salary_freq,
        payment_day_of_month: data?.payment_day_of_month,
      };

      const from_date = data?.from_date;
      delete data?.standarized_shift_hours;
      delete data?.ot_pay_type;
      delete data?.min_half_day_hours;
      delete data?.standard_monthly_days;
      delete data?.salary_freq;
      delete data?.from_date;
      delete data?.payment_day_of_month;


      const company =  await this.prisma.handlePrismaError(this.prisma.company.create({
        data: {
          ...data,
          company_data_history: {
            create: {
              ...history_data,
              from_date: from_date ?? new Date(),
            },
          },
        },
      }));

      // setting it in env -----------------
      setEnvValue('SMTP_USERNAME', data?.smtp_username);
      setEnvValue('SMTP_PASSWORD', data?.smtp_password);

      return company;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateCompany): Promise<Company> {
    try {
      const company_exist = await this.prisma.company.findUnique({
        where: { company_id: id },
      });

      if (!company_exist) {
        throw new NotFoundException('Company does not exist!');
      }

      if (
        data?.ot_pay_type ||
        data?.standarized_shift_hours ||
        data?.min_half_day_hours ||
        data?.salary_freq ||
        data?.standard_monthly_days
      ) {
        const endDate = new Date();
        const company_data_history = await this.prisma.companyData.findMany({
          where: { company_id: id },
          orderBy: {
            end_date: 'desc',
          },
        });

        if (company_data_history[0]) {
          await this.prisma.handlePrismaError(
            this.prisma.companyData.update({
              where: { companydata_id: company_data_history[0].companydata_id },
              data: {
                end_date: data?.from_date ?? endDate,
              },
            })
          );
        }

        await this.prisma.handlePrismaError(
          this.prisma.companyData.create({
            data: {
              ot_pay_type: data?.ot_pay_type ?? company_data_history[0]?.ot_pay_type,
              standarized_shift_hours: data?.standarized_shift_hours ?? company_data_history[0]?.standarized_shift_hours,
              min_half_day_hours: data?.min_half_day_hours ?? company_data_history[0]?.min_half_day_hours,
              standard_monthly_days: data?.standard_monthly_days ?? company_data_history[0]?.standard_monthly_days,
              salary_freq: data?.salary_freq ?? company_data_history[0]?.salary_freq,
              payment_day_of_month: data?.payment_day_of_month ?? company_data_history[0]?.payment_day_of_month,
              from_date: data?.from_date ?? endDate,
              company_id: id,
            },
          })
        );

        delete data?.ot_pay_type;
        delete data?.standarized_shift_hours;
        delete data?.min_half_day_hours;
        delete data?.standard_monthly_days;
        delete data?.salary_freq;
        delete data?.from_date;
        delete data?.payment_day_of_month;
      }

      const company = await this.prisma.handlePrismaError(
        this.prisma.company.update({
          where: { company_id: id },
          data: {
            ...data,
          },
        })
      );

      if (data?.smtp_password || data.smtp_username) {
        // setting it in env -----------------
        setEnvValue('SMTP_USERNAME', data?.smtp_username ?? company?.smtp_username);
        setEnvValue('SMTP_PASSWORD', data?.smtp_password ?? company?.smtp_password);
      }

      return company;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occurred');
    }
  }

}
