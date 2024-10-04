import { PrismaService } from 'src/prisma.service';
import { Remark } from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRemark, DeleteRemark, UpdateRemark } from './dto/remark.dto';
import * as moment from 'moment';

@Injectable()
export class RemarkService {
  constructor(private prisma: PrismaService) {}

  async getUserRemarks(id: string, userId: string): Promise<Remark[]> {
    try {
      if (userId && id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      const remarks = await this.prisma.remark.findMany({
        where: { user_id: id },
        orderBy: [{ remark_date: 'asc' }],
      });

      return remarks;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateRemark): Promise<Remark> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: data?.user_id },
      });

      if (!user) {
        throw new ConflictException('User Not Found');
      }

      const remark =  await this.prisma.handlePrismaError(this.prisma.remark.create({
        data: {
          ...data,
        },
      }));

      return remark;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateRemark): Promise<Remark> {
    try {
      let remark = await this.prisma.remark.findUnique({
        where: { remark_id: id },
      });

      if (!remark) {
        throw new ConflictException('Remark not found');
      }

      remark =  await this.prisma.handlePrismaError(this.prisma.remark.update({
        where: { remark_id: id },
        data: data,
      }));

      return remark;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteRemark): Promise<any> {
    try {
      const remarks =  await this.prisma.handlePrismaError(this.prisma.remark.deleteMany({
        where: {
          remark_id: {
            in: data?.remarks,
          },
        },
      }));

      if (remarks.count === 0) {
        throw new ConflictException('Remarks could not be deleted');
      }

      return {
        message: 'Remarks deleted successfully',
        deletedRemarks: data.remarks,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
