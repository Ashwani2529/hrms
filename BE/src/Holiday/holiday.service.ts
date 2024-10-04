import { PrismaService } from 'src/prisma.service';
import { Holiday } from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHoliday, DeleteHoliday, UpdateHoliday } from './dto/holiday.dto';
import * as moment from 'moment';

@Injectable()
export class HolidayService {
  constructor(private prisma: PrismaService) {}

  async getHoliday(
    search: string,
    startDate: string | null,
    endDate: string | null,
    type: string,
    page: string,
    limit: string,
    userId?: string,
  ): Promise<any> {
    try {

      const query: any = {
        include: {
          user_holiday: {
            select: {
              user: {
                select: {
                  user_id: true,
                  user_name: true,
                  user_email: true,
                  profile_photo: true,
                },
              },
            },
          },
        },
      };
      const whereOneTime: any = {
        holiday_type: 'HOLIDAY',
        OR: [
          {
            holiday_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };

      let whereRecurring: any = {
        holiday_type: {
          in: ['WEEKOFF', 'WEEKOFF_NON_REPEAT'],
        },
        OR: [
          {
            holiday_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };

      // if user id is given -----------
      if (userId) {
        whereOneTime.user_holiday = {
          some: {
            user: {
              user_id: userId,
            },
          },
        };
        whereRecurring.user_holiday = {
          some: {
            user: {
              user_id: userId,
            },
          },
        };
      }

      //  start and end date filter ----------
      if (startDate && endDate) {
        let newStartDate = moment(startDate, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );
        let newEndDate = moment(endDate, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );


        // onetime logic -----------
        whereOneTime.holiday_date = {
          gte: new Date(newStartDate),
          lte: new Date(newEndDate),
        };

        // recurring logic --------
        whereRecurring = {
          ...whereRecurring,
          OR: [
            { end_date: null, holiday_date: { lte: new Date(newEndDate) } , holiday_type:"WEEKOFF" },
            {
              AND: [
                { end_date: { not: null } },
                {
                  holiday_date: {
                    gte: new Date(newStartDate),
                    lte: new Date(newEndDate),
                  },
                }
              ],
            },
            {
              AND: [
                { end_date: { not: null } },
                {
                  end_date: { gte: new Date(newStartDate), lte: new Date(newEndDate) },
                },
              ],
            },
            {
              AND: [
                { end_date: { not: null } },
                { holiday_date: { lte: new Date(newStartDate) } },
                { end_date: { gte: new Date(newEndDate) } },
              ],
            },
            {
              AND: [
                { end_date: null },
                {
                  holiday_date: {
                    gte: new Date(newStartDate),
                    lte: new Date(newEndDate),
                  },
                },
                { holiday_type: 'WEEKOFF_NON_REPEAT' },
              ],
            },
          ],
        };
      } else {
        if (startDate) {
          const newStartDate = moment(startDate, 'YYYY-MM-DD').format(
            'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
          );

          // onetime logic -----------
          whereOneTime.holiday_date = { gte: new Date(newStartDate) };

          // recurring logic --------
          whereRecurring = {
            ...whereRecurring,
            OR: [
              { end_date: { gte: new Date(newStartDate) } },
              { end_date: { equals: null } },
            ],
          };
        }

        if (endDate) {
          const newEndDate = moment(endDate, 'YYYY-MM-DD').format(
            'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
          );

          // onetime logic -----------
          whereOneTime.holiday_date = { lte: new Date(newEndDate) };

          // recurring logic --------
          whereRecurring = {
            ...whereRecurring,
            OR: [
              { end_date: { lte: new Date(newEndDate) } },
              { end_date: { equals: null } },
            ],
          };
        }
      }

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      let holidays = [];

      if (type) {
        type === 'HOLIDAY'
          ? (query.where = whereOneTime)
          : (query.where = whereRecurring);
        holidays = await this.prisma.holiday.findMany(query);
      } else {
        const holidays1 = await this.prisma.holiday.findMany({
          ...query,
          where: whereOneTime,
        });
        const holidays2 = await this.prisma.holiday.findMany({
          ...query,
          where: whereRecurring,
        });
        holidays = holidays.concat(holidays1, holidays2);
      }

      const FinalData = { HOLIDAY: [], WEEKOFF: {} };

      for (let index = 0; index < holidays.length; index++) {
        const element = holidays[index];
        if (element.holiday_type === 'HOLIDAY') {
          FinalData.HOLIDAY.push(element);
        } else {
          if (FinalData.WEEKOFF.hasOwnProperty(element.status)) {
            FinalData.WEEKOFF[element.status]?.push(element);
          } else {
            FinalData.WEEKOFF[element.status] = [element];
          }
        }
      }

      return { Holidays: FinalData };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getHolidayWithInfo(
    search: string,
    startDate: string | null,
    endDate: string | null,
    type: string,
    page: string,
    limit: string,
  ): Promise<any> {
    try {
      const query: any = {};
      const where: any = {
        OR: [
          {
            holiday_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };

      if (startDate) {
        where.holiday_date = {
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.holiday_date = {
          lte: new Date(endDate),
        };
      }

      if (type) where.holiday_type = type;
      const totalHolidays = await this.prisma.holiday.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const holidays = await this.prisma.holiday.findMany(query);

      return { holidays, totalHolidays };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getHolidayById(id: string, userId: string): Promise<Holiday> {
    try {
      const holiday = await this.prisma.holiday.findUnique({
        where: { holiday_id: id },
        include: {
          user_holiday: {
            select: {
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

      if (!holiday) {
        throw new NotFoundException('Holiday not found');
      }

      if (userId && holiday.user_holiday[0]?.user?.user_id !== userId) {
        throw new ForbiddenException('You are not allowed');
      }

      return holiday;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteHoliday(data: DeleteHoliday): Promise<any> {
    try {
      const holiday = await this.prisma.holiday.findFirst({
        where: { holiday_id: data?.id },
        include: {
          user_holiday: {
            select: {
              user: {
                select: {
                  user_id: true,
                },
              },
            },
          },
        },
      });

      if (!holiday) {
        throw new NotFoundException('Holiday not found');
      }

      if (
        holiday.holiday_type === 'HOLIDAY' || holiday.holiday_type === 'WEEKOFF_NON_REPEAT' ||
        (holiday.holiday_type === 'WEEKOFF' && !holiday.parent_holiday)
      ) {
        // delete some particular users from it -------
        if (data?.user_holidays) {
          await this.prisma.handlePrismaError(
            this.prisma.user_holiday.deleteMany({
              where: {
                holiday: {
                  holiday_id: data?.id,
                },
                user_id: {
                  in: data?.user_holidays,
                },
              },
            }),
          );

          const holiday = await this.prisma.holiday.findFirst({
            where: { holiday_id: data?.id },
            include: {
              user_holiday: {
                select: {
                  user: {
                    select: {
                      user_id: true,
                    },
                  },
                },
              },
            },
          });

          if (holiday?.user_holiday?.length === 0 || !holiday?.user_holiday) {
            await this.prisma.handlePrismaError(
              this.prisma.holiday.delete({
                where: {
                  holiday_id: data.id,
                },
              }),
            );
          }
        } else {
          await this.prisma.handlePrismaError(
            this.prisma.user_holiday.deleteMany({
              where: {
                holiday: {
                  holiday_id: data?.id,
                },
              },
            }),
          );

          await this.prisma.handlePrismaError(
            this.prisma.holiday.delete({
              where: {
                holiday_id: data.id,
              },
            }),
          );
        }
      } else {
        if (data?.delete_type === 'SINGLE_HOLIDAY') {
          const dayCheck = moment(data?.holiday_date).format('dddd');

          const dateCheck = await this.prisma.holiday.findMany({
            where: {
              holiday_date: {
                lte: data.holiday_date,
              },
              OR: [
                { end_date: { gt: data.holiday_date } },
                { end_date: { equals: null } },
              ],
              custom_repeat: {
                has: dayCheck,
              },
            },
          });

          if (dateCheck?.length > 1) {
            throw new ConflictException('Conflict between holidays');
          }

          if (dateCheck[0]?.holiday_id !== data.id) {
            throw new ConflictException(
              'The day selected is not falling under holiday',
            );
          }

          // update the previos parent holiday --------
          await this.prisma.handlePrismaError(
            this.prisma.holiday.update({
              where: { holiday_id: data?.id },
              data: {
                end_date: moment(data?.holiday_date, 'YYYY-MM-DD')
                  .subtract(1, 'days')
                  .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              },
            }),
          );

          await this.prisma.handlePrismaError(
            this.prisma.holiday.create({
              data: {
                holiday_name: holiday.holiday_name,
                holiday_date: moment(data?.holiday_date, 'YYYY-MM-DD')
                  .add(1, 'days')
                  .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
                holiday_type: holiday.holiday_type,
                custom_repeat: holiday.custom_repeat,
                parent_holiday: true,
                user_holiday: {
                  createMany: {
                    data: (holiday?.user_holiday || []).map((user, i) => ({
                      user_id: user?.user?.user_id,
                    })),
                  },
                },
              },
            }),
          );
        }

        // delete all folow up holidays ------------------------
        else if (data?.delete_type === 'FOLLOW_UP_HOLIDAY') {
          await this.prisma.handlePrismaError(
            this.prisma.holiday.update({
              where: { holiday_id: data?.id },
              data: {
                end_date: moment(data?.holiday_date, 'YYYY-MM-DD')
                  .subtract(1, 'days')
                  .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              },
            }),
          );
        } else {
          throw new ConflictException('Invalid Delete type');
        }
      }

      return {
        message: 'Holiday deleted successfully',
        deletedHolidays: data.id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  async createHoliday(data: CreateHoliday): Promise<Holiday> {
    try {
      let holiday: Holiday;

      if (
        data.holiday_type === 'HOLIDAY' ||
        data.holiday_type === 'WEEKOFF_NON_REPEAT'
      ) {
        holiday = await this.prisma.holiday.findFirst({
          where: {
            holiday_date: moment(data.holiday_date, 'YYYY-MM-DD').format(
              'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
            ),
            holiday_type: data?.holiday_type,
          },
        });

        if (!holiday) {
          holiday = await this.prisma.handlePrismaError(
            this.prisma.holiday.create({
              data: {
                holiday_name: data.holiday_name,
                holiday_date: moment(data.holiday_date, 'YYYY-MM-DD').format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
                holiday_type: data.holiday_type,
                custom_repeat: data.custom_repeat,
              },
            }),
          );
        }

        if (Object.keys(data).includes('user_holiday')) {
          await this.prisma.handlePrismaError(
            this.prisma.user_holiday.createMany({
              data: (data?.user_holiday || []).map((_, i) => ({
                user_id: data.user_holiday[i],
                holiday_id: holiday.holiday_id,
              })),
            }),
          );
        }
      } else {
        //  parent recurring holiday -----------
        holiday = await this.prisma.handlePrismaError(
          this.prisma.holiday.create({
            data: {
              holiday_name: data.holiday_name,
              holiday_date: moment(new Date(), 'YYYY-MM-DD').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
              ),
              holiday_type: data.holiday_type,
              custom_repeat: data.custom_repeat,
              parent_holiday: true,
              user_holiday: {
                createMany: {
                  data: (data?.user_holiday || []).map((_, i) => ({
                    user_id: data.user_holiday[i],
                  })),
                },
              },
            },
          }),
        );
      }

      return holiday;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Something went wrong. Please try again later.',
      );
    }
  }

  async updateHoliday(id: string, data: UpdateHoliday): Promise<Holiday> {
    try {
      let holiday = await this.prisma.holiday.findFirst({
        where: {
          holiday_id: id,
        },
      });

      if (!holiday) {
        throw new NotFoundException('Holiday not found');
      }

      if (
        holiday.holiday_type === 'HOLIDAY' ||
        holiday.holiday_type === 'WEEKOFF_NON_REPEAT' ||
        (holiday.holiday_type === 'WEEKOFF' && !holiday.parent_holiday)
      ) {
        await this.prisma.handlePrismaError(
          this.prisma.holiday.update({
            where: { holiday_id: id },
            data: {
              holiday_name: data?.holiday_name,
              holiday_date: moment(data?.holiday_date, 'YYYY-MM-DD').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
              ),
            },
          }),
        );

        if (Object.keys(data).includes('user_holiday')) {
          await this.prisma.handlePrismaError(
            this.prisma.user_holiday.deleteMany({
              where: {
                holiday_id: id,
              },
            }),
          );

          for (let i = 0; i < data.user_holiday.length; i++) {
            await this.prisma.handlePrismaError(
              this.prisma.user_holiday.create({
                data: {
                  user_id: data.user_holiday[i],
                  holiday_id: holiday.holiday_id,
                },
              }),
            );
          }
        }
      } else {
        if (data.update_type === 'SINGLE_HOLIDAY') {
          const check = await this.prisma.holiday.findFirst({
            where: {
              repeatId: id,
              parent_holiday: false,
              holiday_date: moment(data.holiday_date, 'YYYY-MM-DD').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
              ),
            },
          });

          if (check) {
            throw new ConflictException('Edited Weekoff already present for that day');
          }

          if (
            !holiday.custom_repeat.includes(moment(data?.holiday_date).format('dddd'))
          ) {
            throw new ConflictException(
              'Marked date not falls under the asked Recurring holiday',
            );
          }

          holiday = await this.prisma.handlePrismaError(
            this.prisma.holiday.create({
              data: {
                holiday_name: data?.holiday_name ?? holiday.holiday_name,
                holiday_date: moment(data?.holiday_date, 'YYYY-MM-DD').format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
                holiday_type: holiday.holiday_type,
                custom_repeat: holiday.custom_repeat,
                status: 'Edited',
                repeatId: holiday.holiday_id,
                user_holiday: {
                  createMany: {
                    data: (data?.user_holiday || []).map((_, i) => ({
                      user_id: data?.user_holiday[i],
                    })),
                  },
                },
              },
            }),
          );
        }

        // next all holiday edits ---------------------
        else {
          // update the previos parent holiday --------
          await this.prisma.handlePrismaError(
            this.prisma.holiday.update({
              where: { holiday_id: id },
              data: {
                end_date: moment(data?.holiday_date, 'YYYY-MM-DD')
                  .subtract(1, 'days')
                  .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              },
            }),
          );

          holiday = await this.prisma.handlePrismaError(
            this.prisma.holiday.create({
              data: {
                holiday_name: data?.holiday_name ?? holiday.holiday_name,
                holiday_date: moment(data?.holiday_date, 'YYYY-MM-DD').format(
                  'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                ),
                holiday_type: holiday.holiday_type,
                custom_repeat: data?.custom_repeat ?? holiday.custom_repeat,
                parent_holiday: true,
                user_holiday: {
                  createMany: {
                    data: (data?.user_holiday || []).map((_, i) => ({
                      user_id: data?.user_holiday[i],
                    })),
                  },
                },
              },
            }),
          );
        }
      }

      return holiday;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Something went wrong. Please try again later.',
      );
    }
  }
}
