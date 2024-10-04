import { PrismaService } from 'src/prisma.service';
import { Checkin, LOG_TYPE, Shift } from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CheckinDelete,
  CreateAutomateCheckIn,
  CreateManualCheckIn,
  UpdateCheckIn,
} from './dto/checkin.dto';
import * as moment from 'moment';

@Injectable()
export class CheckinService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    search: string,
    startDate: string,
    endDate: string,
    type: string,
    page: string,
    limit: string,
    userId: string,
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
            shift: {
              shift_name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      };

      // if user id is given -----------
      if (userId) {
        where.user_id = userId;
      }

      if (startDate) {
        where.log_time = {
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.log_time = {
          lte: new Date(endDate),
        };
      }

      if (type) where.log_type = type as LOG_TYPE;
      query.where = where;

      const totalCheckins = await this.prisma.checkin.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const checkins = await this.prisma.checkin.findMany(query);

      return { checkins, totalCheckins };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async findWithInfo(
    search: string,
    startDate: string,
    endDate: string,
    type: string,
    page: string,
    limit: string,
    userId: string,
  ): Promise<any> {
    try {
      const query: any = {
        include: {
          user: {
            select: {
              user_id: true,
              user_name: true,
              user_email: true,
              user_device_id: true,
              profile_photo: true,
            },
          },
          shift: {
            select: {
              shift_id: true,
              shift_name: true,
              start_time: true,
              end_time: true,
            },
          },
        },
      };
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
            shift: {
              shift_name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ],
      };

      // if user id is given -----------
      if (userId) {
        where.user_id = userId;
      }

      if (startDate) {
        where.log_time = {
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.log_time = {
          lte: new Date(endDate),
        };
      }

      if (type) where.log_type = type as LOG_TYPE;
      query.where = where;

      const totalCheckins = await this.prisma.checkin.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const checkins = await this.prisma.checkin.findMany(query);

      return { checkins, totalCheckins };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async findOne(id: string, userId: string): Promise<Checkin> {
    try {
      const checkin = await this.prisma.checkin.findUnique({
        where: { checkin_id: id },
        include: {
          user: true,
          shift: true,
        },
      });

      if (!checkin) {
        throw new NotFoundException('Checkin not found');
      }

      if (userId && checkin.user_id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      return checkin;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateManualCheckIn): Promise<Checkin> {
    try {
      const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
        data: {
          user_id: data.user_id,
          shift_id: data.shift_id,
          log_type: data.log_type,
          log_time: data.log_time,
          device_id: data.device_id,
        },
      }));
      return checkin;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateCheckIn): Promise<Checkin> {
    try {
      const checkin = await this.prisma.checkin.findUnique({
        where: { checkin_id: id },
      });
      if (!checkin) {
        throw new NotFoundException('Checkin not found');
      }
      return  await this.prisma.handlePrismaError(this.prisma.checkin.update({
        where: { checkin_id: id },
        data: {
          user_id: data.user_id,
          shift_id: data.shift_id,
          log_type: data.log_type,
          log_time: data.log_time,
          device_id: data.device_id,
        },
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(body: CheckinDelete): Promise<any> {
    try {
      await this.prisma.handlePrismaError(this.prisma.attendance.deleteMany({
        where: {
          OR: [
            { check_in_id: { in: body.checkins } },
            { check_out_id: { in: body.checkins } },
          ],
        },
      }));

      const checkinDelete =  await this.prisma.handlePrismaError(this.prisma.checkin.deleteMany({
        where: {
          checkin_id: {
            in: body.checkins,
          },
        },
      }));

      if (checkinDelete.count === 0) {
        throw new NotFoundException('Checkin does not exist!');
      }

      return {
        message: 'Checkins deleted successfully',
        deletedCheckins: body.checkins,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createCheckIn(data: CreateAutomateCheckIn): Promise<Checkin> {
    try {
      if (!data.user_id && !data.user_device_id) {
        throw new NotFoundException('Need at least one of user_id or user_device_id');
      }

      if (!data.user_id) {
        const usr = await this.prisma.user.findUnique({
          where: {
            user_device_id: data.user_device_id,
          },
          select: {
            user_id: true,
          },
        });

        if (!usr) {
          throw new NotFoundException('User not found with this user device id');
        }

        data.user_id = usr.user_id;
      }

      const lateCheckIns = await this.prisma.shift.findMany({
        where: {
          user_shift: {
            some: {
              user_id: data.user_id,
            },
          },
          start_time: {
            lt: data.log_time,
          },
          end_time: {
            gte: data.log_time,
          },
        },
      });

      if (lateCheckIns.length > 0) {
        const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
          data: {
            user_id: data.user_id,
            shift_id: lateCheckIns[0].shift_id,
            log_type: data.log_type,
            log_time: data.log_time,
            device_id: data.device_id,
          },
        }));

        return checkin;
      }

      //Possible Early Checkins
      const PEC = await this.prisma.shift.findMany({
        where: {
          user_shift: {
            some: {
              user_id: data.user_id,
            },
          },
          start_time: {
            gte: data.log_time,
          },
        },
        orderBy: {
          start_time: 'asc',
        },
      });

      if (
        PEC.length > 0 &&
        moment(PEC[0].start_time).subtract(PEC[0].begin_checkin, 'minute').toDate() <=
          moment(data.log_time).toDate()
      ) {
        const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
          data: {
            user_id: data.user_id,
            shift_id: PEC[0].shift_id,
            log_type: data.log_type,
            log_time: data.log_time,
            device_id: data.device_id,
          },
        }));
        return checkin;
      }

      const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
        data: {
          user_id: data.user_id,
          log_type: data.log_type,
          log_time: data.log_time,
          device_id: data.device_id,
        },
      }));

      return checkin;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createCheckOut(data: CreateAutomateCheckIn): Promise<Checkin> {
    try {
      if (!data.user_id && !data.user_device_id) {
        throw new NotFoundException('Need at least one of user_id or user_device_id');
      }

      if (!data.user_id) {
        const usr = await this.prisma.user.findUnique({
          where: {
            user_device_id: data.user_device_id,
          },
          select: {
            user_id: true,
          },
        });

        if (!usr) {
          throw new NotFoundException('User not found with this user device id');
        }

        data.user_id = usr.user_id;
      }

      const earlyCheckOuts = await this.prisma.shift.findMany({
        where: {
          user_shift: {
            some: {
              user_id: data.user_id,
            },
          },
          start_time: {
            lte: data.log_time,
          },
          end_time: {
            gte: data.log_time,
          },
        },
      });

      if (earlyCheckOuts.length > 0) {
        const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
          data: {
            user_id: data.user_id,
            shift_id: earlyCheckOuts[0].shift_id,
            log_type: data.log_type,
            log_time: data.log_time,
            device_id: data.device_id,
          },
        }));
        return checkin;
      }
      //Possible Late Checkouts
      const PLC = await this.prisma.shift.findMany({
        where: {
          user_shift: {
            some: {
              user_id: data.user_id,
            },
          },
          end_time: {
            lte: data.log_time,
          },
        },
        orderBy: {
          end_time: 'desc',
        },
      });

      if (PLC.length > 0) {
        const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
          data: {
            user_id: data.user_id,
            shift_id: PLC[0].shift_id,
            log_type: data.log_type,
            log_time: data.log_time,
            device_id: data.device_id,
          },
        }));
        return checkin;
      }

      const checkin =  await this.prisma.handlePrismaError(this.prisma.checkin.create({
        data: {
          user_id: data.user_id,
          log_type: data.log_type,
          log_time: data.log_time,
          device_id: data.device_id,
        },
      }));

      return checkin;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
