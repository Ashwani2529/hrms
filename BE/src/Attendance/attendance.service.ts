import { PrismaService } from 'src/prisma.service';
import { ATTENDANCE_TYPE, Attendance, Checkin, Holiday } from '@prisma/client';
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
  CreateAttendance,
  DeleteAttendance,
  UpdateAttendance,
} from './dto/attendance.dto';
import * as moment from 'moment';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getAll(
    search: string,
    startDate: string | null,
    endDate: string | null,
    status: string,
    page: string,
    limit: string,
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

      if (startDate) {
        where.attendance_date = {
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        where.attendance_date = {
          lte: new Date(endDate),
        };
      }
      if (status) where.status = status;
      query.where = where;

      const totalAttendance = await this.prisma.attendance.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const attendance = await this.prisma.attendance.findMany(query);

      return { attendance, totalAttendance };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllWithInfo(
    search: string,
    startDate: string | null,
    endDate: string | null,
    status: string,
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
          checkin: {
            select: {
              checkin_id: true,
              log_time: true,
              log_type: true,
            },
          },
        },
      };
      let where: any = {
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

      if (userId) {
        where.user_id = userId;
      }

      if (startDate && endDate) {
        where = {
          ...where,
          AND: [
            {
              attendance_date: {
                gte: new Date(moment(startDate).format('YYYY-MM-DD')),
              },
            },
            {
              attendance_date: { lte: new Date(moment(endDate).format('YYYY-MM-DD')) },
            },
          ],
        };
      } else if (startDate) {
        where.attendance_date = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
        where.attendance_date = {
          lte: new Date(endDate),
        };
      }

      if (status) where.status = status;
      query.where = where;

      const totalAttendance = await this.prisma.attendance.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const attendance = await this.prisma.attendance.findMany(query);

      return { attendance, totalAttendance };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string, userId: string): Promise<Attendance> {
    try {
      const attendance = await this.prisma.attendance.findUnique({
        where: { attendance_id: id },
        include: {
          user: true,
          shift: true,
          checkin: true,
        },
      });

      if (userId && attendance.user_id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      if (!attendance) {
        throw new NotFoundException(`Attendance #${id} not found`);
      }
      return attendance;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getUserAttendence(
    startDate: string | null,
    endDate: string | null,
    id: string,
    userId: string,
  ): Promise<any> {
    try {
      if (userId && id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      const query: any = {
        select: {
          attendance_date: true,
          attendance_id: true,
          status: true,
        },
      };

      const where: any = {
        user_id: id,
      };

      if (startDate) {
        where.attendance_date = {
          gte: new Date(startDate), // last one year attendance ---------------
        };
      } else {
        where.attendance_date = {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // last one year attendance ---------------
        };
      }

      if (endDate) {
        where.attendance_date = {
          ...where.attendance_date,
          lte: new Date(endDate), // last one year attendance ---------------
        };
      }

      query.where = where;
      const attendance = await this.prisma.attendance.findMany(query);

      if (!attendance) {
        throw new NotFoundException(`Attendance for user #${id} not found`);
      }
      return attendance;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateAttendance): Promise<Attendance> {
    try {
      data.attendance_date = moment(
        data.attendance_date,
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      ).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

      const attendance = await this.prisma.attendance.create({
        data,
      });
      return attendance;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateAttendance): Promise<Attendance> {
    try {
      if (data?.attendance_date) {
        data.attendance_date = moment(
          data.attendance_date,
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        ).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }

      if (data?.shift_id) {
        if (data.check_in_id) {
          const check = await this.prisma.checkin.findUnique({
            where: { checkin_id: data.check_in_id },
          });
          if (check && check.shift_id !== data.shift_id) {
            throw new ConflictException(
              `Cannot change shift_id because check_in_id is already exist`,
            );
          }
        }

        if (data.check_out_id) {
          const check = await this.prisma.checkin.findUnique({
            where: { checkin_id: data.check_out_id },
          });
          if (check && check.shift_id !== data.shift_id) {
            throw new ConflictException(
              `Cannot change shift_id because check_out_id is already exist`,
            );
          }
        }
      }

      if ((data.check_in_id || data.check_out_id) && !data.shift_id) {
        throw new ConflictException(
          `Cannot change check_in_id or check_out_id without shift_id`,
        );
      }

      const attendance =  await this.prisma.handlePrismaError(this.prisma.attendance.update({
        where: { attendance_id: id },
        data,
      }));
      return attendance;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteAttendance): Promise<any> {
    try {
      await this.prisma.handlePrismaError(this.prisma.checkin.updateMany({
        where: {
          attendance_id: {
            in: data.attendances,
          },
        },
        data: {
          attendance_id: null,
        },
      }));

      const attendance =  await this.prisma.handlePrismaError(this.prisma.attendance.deleteMany({
        where: {
          attendance_id: {
            in: data.attendances,
          },
        },
      }));

      if (attendance.count === 0) {
        throw new NotFoundException(`Attendance not found`);
      }

      return {
        message: 'Attendance deleted successfully',
        deletedAttendances: data.attendances,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async autoAttendance(shift_id: string): Promise<any> {
    try {
      const shiftDetails = await this.prisma.shift.findUnique({
        where: { shift_id },
        include: {
          user_shift: {
            include: {
              user: {
                include: {
                  checkin: {
                    where: {
                      shift_id,
                      attendance_id: null
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!shiftDetails) {
        throw new NotFoundException(`Shift #${shift_id} not found`);
      }

      // check for comapny data at that instant -------------------
      const companyData = await this.prisma.companyData.findFirst({
        where: {
          company_id: shiftDetails?.user_shift[0]?.user?.company_id,
          AND: [
            { from_date: { lte: new Date(shiftDetails?.start_time) } },
            { end_date: { gte: new Date(shiftDetails?.end_time) } },
          ],
        },
        orderBy: [{ from_date: 'desc' }, { end_date: 'desc' }],
      });

      const userCheckins = {};

      for (let i = 0; i < shiftDetails.user_shift.length; i++) {
        const user = shiftDetails.user_shift[i].user;

        if (
          await this.prisma.attendance.findFirst({
            where: {
              user_id: user.user_id,
              shift_id: shift_id,
            },
          })
        ) {
          continue;
        }

        let checkinTemp = [];
        let checkoutTemp = [];

        for (let j = 0; j < user.checkin.length; j++) {
          if (user.checkin[j].log_type === 'IN') {
            checkinTemp.push(user.checkin[j]);
          } else {
            checkoutTemp.push(user.checkin[j]);
          }
        }
        checkinTemp.length > 0 &&
          checkinTemp.sort((a, b) => {
            return new Date(a.log_time).getTime() - new Date(b.log_time).getTime();
          });
        checkoutTemp.length > 0 &&
          checkoutTemp.sort((a, b) => {
            return new Date(b.log_time).getTime() - new Date(a.log_time).getTime();
          });

        userCheckins[user.user_id] = {
          checkin: checkinTemp.length > 0 ? checkinTemp[0] : null,
          checkout: checkoutTemp.length > 0 ? checkoutTemp[0] : null,
        };
      }

      for (let usr in userCheckins) {
        const leaveDay = await this.prisma.leave.findFirst({
          where: {
            user_id: usr,
            leave_start_date: {
              lte: moment(shiftDetails.start_time).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            },
            leave_end_date: {
              gte: moment(shiftDetails.start_time).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            },
          },
        });

        const Holiday = await this.prisma.holiday.findFirst({
          where: {
            holiday_date: moment(shiftDetails.start_time)
              .startOf('day')
              .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            user_holiday: {
              some: {
                user_id: usr,
              },
            },
          },
        });


        if (userCheckins[usr].checkin && userCheckins[usr].checkout) {
          let userShiftTime = moment(shiftDetails.end_time).diff(
            moment(shiftDetails.start_time),
          );
          let userCheckinTime = moment(userCheckins[usr].checkout.log_time).diff(
            moment(userCheckins[usr].checkin.log_time),
          );

          let attendence: Attendance;

          // check for half or full days status -------------
          // Checking half day from company given data for standarised shift ---------
          const attStatus =
            userShiftTime - shiftDetails?.begin_checkout * 60 * 1000 <=
              companyData?.standarized_shift_hours * 3600000 &&
            userShiftTime + shiftDetails?.begin_checkout * 60 * 100 >=
              companyData?.standarized_shift_hours * 3600000
              ? moment(shiftDetails.end_time).diff(
                  userCheckins[usr].checkout.log_time,
                ) >
                shiftDetails?.begin_checkout * 60000
                ? userCheckinTime >= companyData?.min_half_day_hours * 3600000
                  ? 'HALF_DAY'
                  : 'ABSENT'
                : 'PRESENT'
              : moment(shiftDetails.end_time).diff(
                    userCheckins[usr].checkout.log_time,
                  ) >
                  shiftDetails?.begin_checkout * 60000
                ? userCheckinTime > 0.5 * userShiftTime
                  ? 'HALF_DAY'
                  : 'ABSENT'
                : 'PRESENT';

          // means the user is on ot --------
          if (leaveDay || Holiday) {
            attendence =  await this.prisma.handlePrismaError(this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: 'OVER_TIME',
                check_in_id: userCheckins[usr].checkin.checkin_id,
                check_out_id: userCheckins[usr].checkout.checkin_id,
                attendance_date: moment(userCheckins[usr].checkin.log_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
                ot_hours: moment.duration(userCheckinTime).asHours(),
              },
            }));
          }

          // checking overtime ---------
          else if (
            moment(userCheckins[usr].checkout.log_time).diff(
              moment(shiftDetails.end_time),
            ) >
            shiftDetails?.begin_checkout * 60 * 1000
          ) {
            //  normal attendance creation -------------------
            attendence =  await this.prisma.handlePrismaError(this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: attStatus,
                check_in_id: userCheckins[usr].checkin.checkin_id,
                check_out_id: userCheckins[usr].checkout.checkin_id,
                attendance_date: moment(userCheckins[usr].checkin.log_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
                ot_hours: moment
                  .duration(
                    moment(userCheckins[usr].checkout.log_time).diff(
                      moment(shiftDetails.end_time),
                    ),
                  )
                  .asHours(),
                attendance_hours:
                  attStatus === 'HALF_DAY' || attStatus === 'ABSENT'
                    ? parseInt((userCheckinTime / 3600000).toFixed(2))
                    : parseInt((userShiftTime / 3600000).toFixed(2)),
              },
            }));
          } else {
            attendence =  await this.prisma.handlePrismaError(this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: attStatus,
                check_in_id: userCheckins[usr].checkin.checkin_id,
                check_out_id: userCheckins[usr].checkout.checkin_id,
                attendance_hours:
                  attStatus === 'HALF_DAY' || attStatus === 'ABSENT'
                    ? parseInt((userCheckinTime / 3600000).toFixed(2))
                    : parseInt((userShiftTime / 3600000).toFixed(2)),
                attendance_date: moment(userCheckins[usr].checkin.log_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
              },
            }));
          }

          await this.prisma.handlePrismaError(this.prisma.checkin.update({
            where: {
              checkin_id: userCheckins[usr].checkin.checkin_id,
            },
            data: {
              attendance_id: attendence.attendance_id,
            },
          }));

          await this.prisma.handlePrismaError(this.prisma.checkin.update({
            where: {
              checkin_id: userCheckins[usr].checkout.checkin_id,
            },
            data: {
              attendance_id: attendence.attendance_id,
            },
          }));
        } else {
          if (leaveDay) {
            const attendence =  await this.prisma.handlePrismaError(this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: leaveDay.leave_type,
                check_in_id: null,
                check_out_id: null,
                attendance_date: moment(shiftDetails.start_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
              },
            }));
            continue;
          } else if (Holiday) {
            const attendence = await this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: Holiday.holiday_type === "WEEKOFF_NON_REPEAT" ? "WEEKOFF" : Holiday.holiday_type,
                check_in_id: null,
                check_out_id: null,
                attendance_date: moment(shiftDetails.start_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
              },
            });
            continue;
          } else {
            await this.prisma.handlePrismaError(this.prisma.attendance.create({
              data: {
                user_id: usr,
                shift_id: shift_id,
                status: 'ABSENT',
                check_in_id: userCheckins[usr].checkin
                  ? userCheckins[usr].checkin.checkin_id
                  : null,
                check_out_id: userCheckins[usr].checkout
                  ? userCheckins[usr].checkout.checkin_id
                  : null,
                attendance_date: moment(shiftDetails.start_time).format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
              },
            }));
          }
        }
      }

      return userCheckins;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
