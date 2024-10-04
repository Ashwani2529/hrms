import { PrismaService } from 'src/prisma.service';
import { Holiday, Shift, User_shift } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AssignShiftsByCode,
  CreateShift,
  DeleteShift,
  SwapShifts,
  SwitchShifts,
  UpdateShift,
} from './dto/shift.dto';
import * as moment from 'moment';
import { randomUUID } from 'crypto';
import { HolidayService } from 'src/Holiday/holiday.service';
import { forEach } from 'lodash';

@Injectable()
export class ShiftService {
  constructor(
    private prisma: PrismaService,
    private holidays: HolidayService,
  ) {}

  async getAll(): Promise<Shift[]> {
    try {
      return await this.prisma.shift.findMany({
        where: {
          parent_repeat_shift: false,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllWithInfo(
    search: string,
    users: string,
    clients: string,
  ): Promise<Shift[]> {
    try {
      const where: any = {
        parent_repeat_shift: false,
        shift_name: {
          contains: search,
          mode: 'insensitive',
        },
      };
      const user_array = users === '' ? [] : users.split(',');
      const client_array = clients === '' ? [] : clients.split(',');

      if (user_array.length > 0) {
        where.user_shift = {
          some: {
            user_id: {
              in: user_array,
            },
          },
        };
      }

      if (client_array.length > 0) {
        where.client_id = {
          in: client_array,
        };
      }

      return await this.prisma.shift.findMany({
        where,
        include: {
          user_shift: {
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
          client: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string): Promise<Shift> {
    try {
      const shift: any = await this.prisma.shift.findUnique({
        where: { shift_id: id },
        include: {
          user_shift: {
            include: {
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
          client: true,
        },
      });

      const employes_on_leave = await this.prisma.user_shift.findMany({
        where: {
          shift_id: id,
          user: {
            leave: {
              some: {
                leave_start_date: {
                  lte: new Date(shift?.end_time),
                },
                leave_end_date: {
                  gte: new Date(shift?.start_time),
                },
              },
            },
          },
        },
      });

      for (let item in shift.user_shift) {
        if (
          employes_on_leave.some(
            (leave: any) => leave.user_id === shift.user_shift[item].user_id,
          )
        ) {
          shift.user_shift[item].user.on_leave = true;
        } else {
          shift.user_shift[item].user.on_leave = false;
        }

        const checkIn = await this.prisma.checkin.findFirst({
          where: {
            shift_id: shift.shift_id,
            user_id: shift.user_shift[item].user.user_id,
          },
        });

        if (!checkIn) {
          shift.user_shift[item].user.unexpected_leave = true;
        } else {
          shift.user_shift[item].user.unexpected_leave = false;
        }
      }

      return shift;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateShift): Promise<Shift | Shift[]> {
    try {
      if (data.start_time > data.end_time) {
        throw new ConflictException('Start time cannot be greater than end time');
      }

      // start time and end time diff is max 24 hours .

      if (data.lunch_break_start || data.lunch_break_end) {
        if (!data.lunch_break_start || !data.lunch_break_end) {
          throw new ConflictException(
            'Either give both lunch break start and end time or none',
          );
        }

        const lunchBreakStart = moment(data.lunch_break_start);
        const lunchBreakEnd = moment(data.lunch_break_end);
        const shiftStartTime = moment(data.start_time);
        const shiftEndTime = moment(data.end_time);

        if (lunchBreakStart.isSameOrAfter(lunchBreakEnd)) {
          throw new ConflictException(
            'Lunch break start time cannot be greater than or equal to end time',
          );
        }

        if (
          lunchBreakStart.isBefore(shiftStartTime) ||
          lunchBreakEnd.isAfter(shiftEndTime) ||
          lunchBreakStart.isAfter(shiftEndTime) ||
          lunchBreakEnd.isBefore(shiftStartTime)
        ) {
          throw new ConflictException(
            'Lunch break start and end time should be between shift start and end time',
          );
        }
      }

      const uniqueShiftName = await this.prisma.handlePrismaError(
        this.prisma.shift.findFirst({
          where: { shift_name: data?.shift_name },
        }),
      );

      if (uniqueShiftName) {
        throw new ConflictException('Shift with similar name exists');
      }

      let shift: Shift | Shift[] = [];

      if (data.repeat === 'None') {
        shift = await this.prisma.handlePrismaError(
          this.prisma.shift.create({
            data: {
              shift_name: data.shift_name,
              start_time: data.start_time,
              end_time: data.end_time,
              begin_checkin: data.begin_checkin,
              begin_checkout: data.begin_checkout,
              lunch_break_start: data.lunch_break_start,
              lunch_break_end: data.lunch_break_end,
              shift_color: data.shift_color,
              custom_repeat: data.custom_repeat,
              auto_attendance: data.auto_attendance,
              client_id: data.client_id,
              status: data.status,
              repeat: data.repeat,
            },
          }),
        );

        await this.update_user_shifts(data, shift.shift_id);
      } else {
        const repeat_id = randomUUID() as string;

        //create parent shift
        await this.prisma.handlePrismaError(
          this.prisma.shift.create({
            data: {
              shift_name: data.shift_name,
              start_time: data.start_time,
              end_time: data.end_time,
              begin_checkin: data.begin_checkin,
              begin_checkout: data.begin_checkout,
              shift_color: data.shift_color,
              auto_attendance: data.auto_attendance,
              client_id: data.client_id,
              lunch_break_start: data.lunch_break_start,
              lunch_break_end: data.lunch_break_end,
              status: data.status,
              repeat: data.repeat,
              custom_repeat: data.custom_repeat,
              repeat_id: repeat_id,
              parent_repeat_shift: true,
            },
          }),
        );
        if (data.repeat === 'Custom') {
          var day_set = new Set();
          data.custom_repeat.forEach((day: string) => {
            day_set.add(day);
          });
        }

        if (data.repeat === 'Custom') {
          await this.prisma.handlePrismaError(
            this.prisma.$transaction(
              Array.from({ length: 28 }, (_, i) => {
                const day = moment(data.start_time).add(i, 'days').format('dddd');
                if (day_set.has(day)) {
                  return this.prisma.shift.create({
                    data: {
                      shift_name: data.shift_name,
                      start_time: moment(data.start_time)
                        .add(i, 'days')
                        .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      end_time: moment(data.end_time)
                        .add(i, 'days')
                        .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      begin_checkin: data.begin_checkin,
                      begin_checkout: data.begin_checkout,
                      shift_color: data.shift_color,
                      auto_attendance: data.auto_attendance,
                      client_id: data.client_id,
                      status: data.status,
                      lunch_break_start:
                        data.lunch_break_start &&
                        moment(data.lunch_break_start)
                          .add(i, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      lunch_break_end:
                        data.lunch_break_end &&
                        moment(data.lunch_break_end)
                          .add(i, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      repeat: data.repeat,
                      custom_repeat: data.custom_repeat,
                      repeat_id: repeat_id,
                      user_shift: {
                        createMany: {
                          data: (data.user_shift || []).map((user_id: string) => ({
                            user_id: user_id,
                          })),
                        },
                      },
                    },
                  });
                }
              }).filter(Boolean),
            ),
          );
        } else {
          await this.prisma.handlePrismaError(
            this.prisma.$transaction(
              Array.from({ length: 28 }, (_, i) => {
                if (data.repeat === 'Daily') {
                  return this.prisma.shift.create({
                    data: {
                      shift_name: data.shift_name,
                      start_time: moment(data.start_time)
                        .utc()
                        .add(i, 'days')
                        .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      end_time: moment(data.end_time)
                        .utc()
                        .add(i, 'days')
                        .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      begin_checkin: data.begin_checkin,
                      begin_checkout: data.begin_checkout,
                      shift_color: data.shift_color,
                      auto_attendance: data.auto_attendance,
                      lunch_break_start:
                        data.lunch_break_start &&
                        moment(data.lunch_break_start)
                          .add(i, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      lunch_break_end:
                        data.lunch_break_end &&
                        moment(data.lunch_break_end)
                          .add(i, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                      client_id: data.client_id,
                      status: data.status,
                      repeat: data.repeat,
                      repeat_id: repeat_id,
                      user_shift: {
                        createMany: {
                          data: (data.user_shift || []).map((user_id: string) => ({
                            user_id: user_id,
                          })),
                        },
                      },
                    },
                  });
                } else {
                  return (
                    i * 7 <= 28 &&
                    this.prisma.shift.create({
                      data: {
                        shift_name: data.shift_name,
                        start_time: moment(data.start_time)
                          .utc()
                          .add(i * 7, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                        end_time: moment(data.end_time)
                          .utc()
                          .add(i * 7, 'days')
                          .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                        begin_checkin: data.begin_checkin,
                        begin_checkout: data.begin_checkout,
                        shift_color: data.shift_color,
                        auto_attendance: data.auto_attendance,
                        lunch_break_start:
                          data.lunch_break_start &&
                          moment(data.lunch_break_start)
                            .add(i * 7, 'days')
                            .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                        lunch_break_end:
                          data.lunch_break_end &&
                          moment(data.lunch_break_end)
                            .add(i * 7, 'days')
                            .format('YYYY-MM-DDTHH:mm:ss[Z]'),
                        client_id: data.client_id,
                        status: data.status,
                        repeat: data.repeat,
                        repeat_id: repeat_id,
                        user_shift: {
                          createMany: {
                            data: (data.user_shift || []).map((user_id: string) => ({
                              user_id: user_id,
                            })),
                          },
                        },
                      },
                    })
                  );
                }
              }).filter(Boolean),
            ),
          );
        }
        shift = await this.prisma.shift.findMany({
          where: {
            repeat_id: repeat_id,
          },
        });
      }
      return shift;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateShift): Promise<Shift> {
    try {
      const shift_exist = await this.prisma.shift.findUnique({
        where: { shift_id: id },
      });
      if (!shift_exist) {
        throw new NotFoundException('Shift does not exist!');
      }

      if (data?.shift_name && shift_exist.shift_name !== data?.shift_name) {
        const uniqueShiftName = await this.prisma.handlePrismaError(
          this.prisma.shift.findFirst({
            where: { shift_name: data?.shift_name },
          }),
        );

        if (uniqueShiftName) {
          throw new ConflictException('Shift with similar name exists');
        }
      }

      if (moment(data.start_time).isAfter(moment(data.end_time))) {
        throw new ConflictException('Start time cannot be greater than end time');
      }

      if (data.lunch_break_start || data.lunch_break_end) {
        if (!data.lunch_break_start || !data.lunch_break_end) {
          throw new ConflictException(
            'Either give both lunch break start and end time or none',
          );
        }

        const lunchBreakStart = moment(data.lunch_break_start);
        const lunchBreakEnd = moment(data.lunch_break_end);
        const shiftStartTime = moment(data.start_time);
        const shiftEndTime = moment(data.end_time);

        if (lunchBreakStart.isSameOrAfter(lunchBreakEnd)) {
          throw new ConflictException(
            'Lunch break start time cannot be greater than or equal to end time',
          );
        }

        if (
          lunchBreakStart.isBefore(shiftStartTime) ||
          lunchBreakEnd.isAfter(shiftEndTime) ||
          lunchBreakStart.isAfter(shiftEndTime) ||
          lunchBreakEnd.isBefore(shiftStartTime)
        ) {
          throw new ConflictException(
            'Lunch break start and end time should be between shift start and end time',
          );
        }
      }

      if (data.update_type && data.update_type === 'ALL_SHIFT') {
        const all_shifts = await this.prisma.shift.findMany({
          where: {
            repeat_id: shift_exist.repeat_id,
            start_time: {
              gte: new Date(),
            },
          },
        });
        const newTimeA = moment(data.start_time).utc().format('HH:mm:ss');
        const newTimeB = moment(data.end_time).utc().format('HH:mm:ss');

        for (let i = 0; i < all_shifts.length; i++) {
          await this.prisma.handlePrismaError(
            this.prisma.shift.update({
              where: {
                shift_id: all_shifts[i].shift_id,
              },
              data: {
                shift_name: data.shift_name,
                start_time: moment(all_shifts[i].start_time)
                  .utc()
                  .set({
                    hour: moment(newTimeA, 'HH:mm:ss').hours(),
                    minute: moment(newTimeA, 'HH:mm:ss').minutes(),
                    second: moment(newTimeA, 'HH:mm:ss').seconds(),
                  })
                  .toDate(),
                end_time: moment(all_shifts[i].end_time)
                  .utc()
                  .set({
                    hour: moment(newTimeB, 'HH:mm:ss').hours(),
                    minute: moment(newTimeB, 'HH:mm:ss').minutes(),
                    second: moment(newTimeB, 'HH:mm:ss').seconds(),
                  })
                  .toDate(),
                begin_checkin: data.begin_checkin,
                begin_checkout: data.begin_checkout,
                lunch_break_start:
                  data.lunch_break_start &&
                  moment(all_shifts[i].lunch_break_start)
                    .utc()
                    .set({
                      hour: moment(data.lunch_break_start, 'HH:mm:ss').hours(),
                      minute: moment(data.lunch_break_start, 'HH:mm:ss').minutes(),
                      second: moment(data.lunch_break_start, 'HH:mm:ss').seconds(),
                    })
                    .toDate(),
                lunch_break_end:
                  data.lunch_break_end &&
                  moment(all_shifts[i].lunch_break_end)
                    .utc()
                    .set({
                      hour: moment(data.lunch_break_end, 'HH:mm:ss').hours(),
                      minute: moment(data.lunch_break_end, 'HH:mm:ss').minutes(),
                      second: moment(data.lunch_break_end, 'HH:mm:ss').seconds(),
                    })
                    .toDate(),
                shift_color: data.shift_color,
                auto_attendance: data.auto_attendance,
                client_id: data.client_id,
                status: data.status,
                repeat: data.repeat,
              },
            }),
          );
          await this.update_user_shifts(data, all_shifts[i].shift_id);
        }
      } else if (data.update_type && data.update_type === 'FOLLOW_UP_SHIFT') {
        const all_shifts = await this.prisma.shift.findMany({
          where: {
            repeat_id: shift_exist.repeat_id,
            parent_repeat_shift: false,
            start_time: {
              gte: shift_exist.start_time,
            },
          },
        });
        const newTimeA = moment(data.start_time).utc().format('HH:mm:ss');
        const newTimeB = moment(data.end_time).utc().format('HH:mm:ss');

        for (let i = 0; i < all_shifts.length; i++) {
          await this.prisma.handlePrismaError(
            this.prisma.shift.update({
              where: {
                shift_id: all_shifts[i].shift_id,
              },
              data: {
                shift_name: data.shift_name,
                start_time: moment(all_shifts[i].start_time)
                  .utc()
                  .set({
                    hour: moment(newTimeA, 'HH:mm:ss').hours(),
                    minute: moment(newTimeA, 'HH:mm:ss').minutes(),
                    second: moment(newTimeA, 'HH:mm:ss').seconds(),
                  })
                  .toDate(),
                end_time: moment(all_shifts[i].end_time)
                  .utc()
                  .set({
                    hour: moment(newTimeB, 'HH:mm:ss').hours(),
                    minute: moment(newTimeB, 'HH:mm:ss').minutes(),
                    second: moment(newTimeB, 'HH:mm:ss').seconds(),
                  })
                  .toDate(),
                begin_checkin: data.begin_checkin,
                begin_checkout: data.begin_checkout,
                shift_color: data.shift_color,
                lunch_break_start:
                  data.lunch_break_start &&
                  moment(all_shifts[i].lunch_break_start)
                    .utc()
                    .set({
                      hour: moment(data.lunch_break_start, 'HH:mm:ss').hours(),
                      minute: moment(data.lunch_break_start, 'HH:mm:ss').minutes(),
                      second: moment(data.lunch_break_start, 'HH:mm:ss').seconds(),
                    })
                    .toDate(),
                lunch_break_end:
                  data.lunch_break_end &&
                  moment(all_shifts[i].lunch_break_end)
                    .utc()
                    .set({
                      hour: moment(data.lunch_break_end, 'HH:mm:ss').hours(),
                      minute: moment(data.lunch_break_end, 'HH:mm:ss').minutes(),
                      second: moment(data.lunch_break_end, 'HH:mm:ss').seconds(),
                    })
                    .toDate(),
                auto_attendance: data.auto_attendance,
                client_id: data.client_id,
                status: data.status,
                repeat: data.repeat,
              },
            }),
          );

          await this.update_user_shifts(data, all_shifts[i].shift_id);
        }
      }

      const shift = await this.prisma.handlePrismaError(
        this.prisma.shift.update({
          where: { shift_id: id },
          data: {
            shift_name: data.shift_name,
            start_time: data.start_time,
            end_time: data.end_time,
            begin_checkin: data.begin_checkin,
            begin_checkout: data.begin_checkout,
            shift_color: data.shift_color,
            auto_attendance: data.auto_attendance,
            client_id: data.client_id,
            lunch_break_start: data.lunch_break_start,
            lunch_break_end: data.lunch_break_end,
            status: data.status,
            repeat: data.repeat,
          },
        }),
      );

      await this.update_user_shifts(data, id);

      return shift;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update_user_shifts(data: any, shift_id: string) {
    try {
      if (Object.keys(data).includes('user_shift')) {
        await this.prisma.handlePrismaError(
          this.prisma.user_shift.deleteMany({
            where: {
              shift_id: shift_id,
            },
          }),
        );

        await this.prisma.handlePrismaError(
          this.prisma.user_shift.createMany({
            data: data.user_shift.map((user_id: string) => ({
              user_id: user_id,
              shift_id: shift_id,
            })),
          }),
        );
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(body: DeleteShift): Promise<any> {
    try {
      if (body.delete_type === 'SINGLE_SHIFT') {
        await this.prisma.handlePrismaError(
          this.prisma.user_shift.deleteMany({
            where: {
              shift_id: {
                in: body.shifts,
              },
            },
          }),
        );

        const shiftDelete = await this.prisma.handlePrismaError(
          this.prisma.shift.deleteMany({
            where: {
              shift_id: {
                in: body.shifts,
              },
            },
          }),
        );

        if (shiftDelete.count === 0) {
          throw new NotFoundException('Shift does not exist!');
        }

        return {
          message: 'Shifts deleted successfully',
          deletedShifts: body.shifts,
        };
      } else if (body.delete_type === 'ALL_SHIFT') {
        const shifts = [];

        for (const shift_id of body.shifts) {
          const shift = await this.prisma.shift.findUnique({
            where: {
              shift_id: shift_id,
            },
            select: {
              repeat_id: true,
              shift_id: true,
            },
          });

          if (shift.repeat_id === null) {
            shifts.push(shift.shift_id);
            continue;
          }

          const all_shifts = await this.prisma.shift.findMany({
            where: {
              repeat_id: shift.repeat_id,
            },
          });

          shifts.push(...all_shifts.map(shift => shift.shift_id));
        }

        if (shifts.length === 0) {
          throw new NotFoundException('Shift does not exist!');
        }

        const shiftDelete = await this.prisma.handlePrismaError(
          this.prisma.shift.deleteMany({
            where: {
              shift_id: {
                in: shifts,
              },
            },
          }),
        );

        if (shiftDelete.count === 0) {
          throw new NotFoundException('Shift does not exist!');
        }

        return {
          message: 'Shifts deleted successfully',
          deletedShifts: shifts,
        };
      } else if (body.delete_type === 'FOLLOW_UP_SHIFT') {
        const shifts = [];

        for (const shift_id of body.shifts) {
          const shift = await this.prisma.shift.findUnique({
            where: {
              shift_id: shift_id,
            },
            select: {
              repeat_id: true,
            },
          });

          if (shift.repeat_id === null) {
            shifts.push(shift_id);
            continue;
          }

          const all_shifts = await this.prisma.shift.findMany({
            where: {
              repeat_id: shift.repeat_id,
              start_time: {
                gte: new Date(),
              },
            },
          });

          shifts.push(...all_shifts.map(shift => shift.shift_id));
        }

        if (shifts.length === 0) {
          throw new NotFoundException('Shift does not exist!');
        }

        await this.prisma.handlePrismaError(
          this.prisma.user_shift.deleteMany({
            where: {
              shift_id: {
                in: shifts,
              },
            },
          }),
        );

        const shiftDelete = await this.prisma.handlePrismaError(
          this.prisma.shift.deleteMany({
            where: {
              shift_id: {
                in: shifts,
              },
            },
          }),
        );

        if (shiftDelete.count === 0) {
          throw new NotFoundException('Shift does not exist!');
        }

        return {
          message: 'Shifts deleted successfully',
          deletedShifts: shifts,
        };
      } else {
        throw new NotFoundException('Invalid delete type');
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteAll(): Promise<any> {
    try {
      await this.prisma.handlePrismaError(this.prisma.user_shift.deleteMany());
      await this.prisma.handlePrismaError(this.prisma.shift.deleteMany());
      return {
        message: 'Shifts deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAssignedShifts(): Promise<User_shift[]> {
    try {
      const shifts = await this.prisma.user_shift.findMany({
        include: {
          shift: true,
          user: true,
        },
      });
      return shifts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAvailableEmployees(
    shiftId: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    try {
      const all_employees: any = await this.prisma.user.findMany({
        where: {
          status: 'Active',
        },
        select: {
          user_id: true,
          user_name: true,
          user_email: true,
          profile_photo: true,
        },
      });

      const busy_employees = await this.prisma.user_shift.findMany({
        where: {
          shift: {
            OR: [
              {
                start_time: {
                  gte: new Date(startTime),
                  lte: new Date(endTime),
                },
              },
              {
                end_time: {
                  gte: new Date(startTime),
                  lte: new Date(endTime),
                },
              },
              {
                start_time: {
                  lte: new Date(startTime),
                },
                end_time: {
                  gte: new Date(startTime),
                },
              },
              {
                start_time: {
                  lte: new Date(endTime),
                },
                end_time: {
                  gte: new Date(endTime),
                },
              },
            ],
          },
        },
        include: {
          user: {
            select: {
              user_id: true,
            },
          },
          shift: {
            select: {
              shift_id: true,
            },
          },
        },
      });

      const on_leave_employees = await this.prisma.leave.findMany({
        where: {
          OR: [
            {
              leave_start_date: {
                lte: new Date(startTime),
              },
              leave_end_date: {
                gte: new Date(endTime),
              },
            },
            {
              leave_start_date: {
                gte: new Date(endTime),
              },
              leave_end_date: {
                lte: new Date(endTime),
              },
            },
            {
              leave_start_date: {
                lte: new Date(startTime),
              },
              leave_end_date: {
                gte: new Date(startTime),
              },
            },
          ],
        },
        select: {
          user_id: true,
        },
      });

      const newStartDate = moment(startTime, 'YYYY-MM-DD').format(
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      );
      const newEndDate = moment(endTime, 'YYYY-MM-DD').format(
        'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
      );

      const days = new Set([
        moment(startTime).format('dddd'),
        moment(endTime).format('dddd'),
      ]);

      const on_holiday_employees = await this.prisma.holiday.findMany({
        where: {
          OR: [
            { parent_holiday: false, holiday_date: { equals: new Date(newStartDate) } },
            {
              AND: [
                {
                  OR: [
                    {
                      end_date: null,
                      holiday_date: { lte: new Date(newEndDate) },
                    },
                    {
                      AND: [
                        { end_date: { not: null } },
                        {
                          holiday_date: {
                            gte: new Date(newStartDate),
                            lte: new Date(newEndDate),
                          },
                        },
                      ],
                    },
                    {
                      AND: [
                        { end_date: { not: null } },
                        {
                          end_date: {
                            gte: new Date(newStartDate),
                            lte: new Date(newEndDate),
                          },
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
                  ],
                },
                { parent_holiday: true, custom_repeat: { hasSome: Array.from(days) } },
              ],
            },
          ],
        },
        select: {
          holiday_id: true,
          repeatId: true,
          status: true,
          user_holiday: {
            select: {
              user_id: true,
            },
          },
        },
      });

      const repeatIds = on_holiday_employees
        ?.filter(e => e?.repeatId)
        ?.map(e => e?.repeatId);

      for (let i = 0; i < all_employees.length; i++) {
        if (
          busy_employees.some(
            busy =>
              busy.user.user_id === all_employees[i].user_id &&
              busy.shift.shift_id !== shiftId,
          )
        ) {
          all_employees[i].busy = true;
        } else {
          all_employees[i].busy = false;
        }

        if (
          on_leave_employees.some(
            (leave: any) => leave.user_id === all_employees[i].user_id,
          )
        ) {
          all_employees[i].on_leave = true;
        } else {
          all_employees[i].on_leave = false;
        }

        if (
          on_holiday_employees
            ?.filter(e => !repeatIds.includes(e.holiday_id))
            ?.flatMap(holiday => holiday?.user_holiday?.map(e => e?.user_id))
            ?.filter(Boolean)
            .some(id => id === all_employees[i].user_id)
        ) {
          all_employees[i].on_holiday = true;
        } else {
          all_employees[i].on_holiday = false;
        }
      }

      return all_employees;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async resolveConflict(data: SwitchShifts): Promise<any> {
    try {
      const shift = await this.prisma.shift.findUnique({
        where: {
          shift_id: data.shift_id,
        },
      });

      if (!shift) {
        throw new NotFoundException('Shift does not exist');
      }

      const resolve_conflict = await this.prisma.handlePrismaError(
        this.prisma.shift.update({
          where: {
            shift_id: data.shift_id,
          },
          data: {
            status: 'Resolved',
          },
        }),
      );

      // user shifts which overlap with the shift
      const user_shifts = await this.prisma.user_shift.findMany({
        where: {
          user_id: {
            in: data.users,
          },
          shift: {
            OR: [
              {
                start_time: {
                  gte: shift.start_time,
                  lt: shift.end_time,
                },
              },
              {
                end_time: {
                  gt: shift.start_time,
                  lte: shift.start_time,
                },
              },
            ],
          },
        },
      });

      await this.prisma.handlePrismaError(
        this.prisma.user_shift.updateMany({
          where: {
            user_id: {
              in: data.users,
            },
            shift: {
              OR: [
                {
                  start_time: {
                    gte: shift.start_time,
                    lt: shift.end_time,
                  },
                },
                {
                  end_time: {
                    gt: shift.start_time,
                    lte: shift.start_time,
                  },
                },
              ],
            },
          },
          data: {
            status: 'Overlap_Conflict',
          },
        }),
      );

      const changed_shifts = [];

      for (let i = 0; i < user_shifts.length; i++) {
        const data = await this.prisma.handlePrismaError(
          this.prisma.user_shift.update({
            where: {
              user_shift_id: user_shifts[i].user_shift_id,
            },
            data: {
              shift_id: shift.shift_id,
            },
          }),
        );
        changed_shifts.push(data);
      }

      return {
        message: 'Shifts switched successfully',
        changed_shifts,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async swapShift(data: SwapShifts): Promise<any> {
    try {
      let user_shift_resp: any = undefined;

      const user_shift_to_swap = await this.prisma.user_shift.findUnique({
        where: {
          user_shift_id: data.from_user_shift_id,
        },
        include: {
          shift: {
            select: {
              start_time: true,
              end_time: true,
            },
          },
        },
      });

      if (!user_shift_to_swap) {
        throw new NotFoundException('Shift does not exist');
      }

      const user_to_swap = this.prisma.user.findUnique({
        where: {
          user_id: data.to_user_id,
        },
      });

      if (!user_to_swap) {
        throw new NotFoundException('User does not exist');
      }

      const check_leave = await this.prisma.leave.findFirst({
        where: {
          user_id: data.to_user_id,
          AND: [
            {
              leave_start_date: {
                lte: new Date(user_shift_to_swap.shift.end_time),
              },
            },
            {
              leave_end_date: {
                gte: new Date(user_shift_to_swap.shift.start_time),
              },
            },
          ],
        },
      });

      if (check_leave) {
        throw new ConflictException('User is on leave');
      }

      const selectQuery = {
        shift: {
          select: {
            shift_name: true,
            start_time: true,
            end_time: true,
            status: true,
            shift_color: true,
            client: {
              select: {
                client_id: true,
                client_name: true,
              },
            },
          },
        },
        user: {
          select: {
            user_name: true,
            user_email: true,
            profile_photo: true,
          },
        },
        user_id: true,
        user_shift_id: true,
        shift_id: true,
      };

      if (data.swap_type === 'SWAP') {
        if (data.swap_conflict === 'NONE') {
          //Update User Shift
          user_shift_resp = await this.prisma.handlePrismaError(
            this.prisma.user_shift.update({
              where: {
                user_shift_id: data.from_user_shift_id,
              },
              data: {
                user_id: data.to_user_id,
                status: 'None',
              },
              select: selectQuery,
            }),
          );
        }
        if (data.swap_conflict === 'MERGE') {
          const existing = await this.prisma.user_shift.findUnique({
            where: {
              user_shift_id: data.conflict_shift_id,
            },
            include: {
              shift: true,
            },
          });

          const new_start = moment(existing.shift.start_time).isBefore(
            moment(user_shift_to_swap.shift.start_time),
          )
            ? existing.shift.start_time
            : user_shift_to_swap.shift.start_time;

          const new_end = moment(existing.shift.end_time).isAfter(
            moment(user_shift_to_swap.shift.end_time),
          )
            ? existing.shift.end_time
            : user_shift_to_swap.shift.end_time;

          //Remove Link from Existing Shift
          await this.prisma.handlePrismaError(
            this.prisma.user_shift.delete({
              where: {
                user_shift_id: data.conflict_shift_id,
              },
            }),
          );

          //Create New Shift
          const newShift = await this.prisma.handlePrismaError(
            this.prisma.shift.create({
              data: {
                shift_name: existing.shift.shift_name,
                start_time: new_start,
                end_time: new_end,
                begin_checkin: existing.shift.begin_checkin,
                begin_checkout: existing.shift.begin_checkout,
                shift_color: existing.shift.shift_color,
                auto_attendance: existing.shift.auto_attendance,
                lunch_break_start: existing.shift.lunch_break_start,
                lunch_break_end: existing.shift.lunch_break_end,
                client_id: existing.shift.client_id,
                status: existing.shift.status,
                repeat_id: null,
                parent_repeat_shift: false,
                repeat: 'None',
                custom_repeat: [],
              },
            }),
          );

          //Create New User Shift
          user_shift_resp = await this.prisma.handlePrismaError(
            this.prisma.user_shift.create({
              data: {
                user_id: data.to_user_id,
                shift_id: newShift.shift_id,
                status: 'None',
              },
              select: selectQuery,
            }),
          );

          await this.prisma.handlePrismaError(
            this.prisma.user_shift.delete({
              where: {
                user_shift_id: data.from_user_shift_id,
              },
            }),
          );
        }
        if (data.swap_conflict === 'REPLACE') {
          //Remove Link from Existing Shift
          await this.prisma.handlePrismaError(
            this.prisma.user_shift.delete({
              where: {
                user_shift_id: data.conflict_shift_id,
              },
            }),
          );

          user_shift_resp = await this.prisma.handlePrismaError(
            this.prisma.user_shift.update({
              where: {
                user_shift_id: data.from_user_shift_id,
              },
              data: {
                user_id: data.to_user_id,
              },
              select: selectQuery,
            }),
          );
        }
      } else if (data.swap_type === 'CLONE') {
        if (data.swap_conflict === 'NONE') {
          const already_exist = await this.prisma.user_shift.findFirst({
            where: {
              user_id: data.to_user_id,
              shift_id: user_shift_to_swap.shift_id,
            },
          });

          if (!already_exist) {
            user_shift_resp = await this.prisma.handlePrismaError(
              this.prisma.user_shift.create({
                data: {
                  user_id: data.to_user_id,
                  shift_id: user_shift_to_swap.shift_id,
                  status: 'None',
                },
                select: selectQuery,
              }),
            );
          }
        }
        if (data.swap_conflict === 'MERGE') {
          const existing = await this.prisma.user_shift.findUnique({
            where: {
              user_shift_id: data.conflict_shift_id,
            },
            include: {
              shift: true,
            },
          });

          const new_start = moment(existing.shift.start_time).isBefore(
            moment(user_shift_to_swap.shift.start_time),
          )
            ? existing.shift.start_time
            : user_shift_to_swap.shift.start_time;

          const new_end = moment(existing.shift.end_time).isAfter(
            moment(user_shift_to_swap.shift.end_time),
          )
            ? existing.shift.end_time
            : user_shift_to_swap.shift.end_time;

          //Remove Link from Existing Shift
          await this.prisma.user_shift.delete({
            where: {
              user_shift_id: data.conflict_shift_id,
            },
          });

          //Create New Shift
          const newShift = await this.prisma.handlePrismaError(
            this.prisma.shift.create({
              data: {
                shift_name: existing.shift.shift_name,
                start_time: new_start,
                end_time: new_end,
                begin_checkin: existing.shift.begin_checkin,
                begin_checkout: existing.shift.begin_checkout,
                shift_color: existing.shift.shift_color,
                auto_attendance: existing.shift.auto_attendance,
                lunch_break_start: existing.shift.lunch_break_start,
                lunch_break_end: existing.shift.lunch_break_end,
                client_id: existing.shift.client_id,
                status: existing.shift.status,
                parent_repeat_shift: false,
                repeat_id: null,
                repeat: 'None',
                custom_repeat: [],
              },
            }),
          );

          //Create New User Shift
          user_shift_resp = await this.prisma.handlePrismaError(
            this.prisma.user_shift.create({
              data: {
                user_id: data.to_user_id,
                shift_id: newShift.shift_id,
                status: 'None',
              },
              select: selectQuery,
            }),
          );
        }
        if (data.swap_conflict === 'REPLACE') {
          // Remove Link from Existing Shift
          await this.prisma.handlePrismaError(
            this.prisma.user_shift.delete({
              where: {
                user_shift_id: data.conflict_shift_id,
              },
            }),
          );

          user_shift_resp = await this.prisma.handlePrismaError(
            this.prisma.user_shift.create({
              data: {
                user_id: data.to_user_id,
                shift_id: user_shift_to_swap.shift_id,
                status: 'None',
              },
              select: selectQuery,
            }),
          );
        }
      }

      if (user_shift_resp === undefined) {
        throw new InternalServerErrorException('Error in swapping shifts');
      }

      await this.prisma.handlePrismaError(
        this.prisma.shift.update({
          where: {
            shift_id: user_shift_resp.shift_id,
          },
          data: {
            status: 'Resolved',
          },
        }),
      );

      const user_shift = {
        shift_name: user_shift_resp.shift?.shift_name,
        start_time: user_shift_resp.shift?.start_time,
        end_time: user_shift_resp.shift?.end_time,
        status: user_shift_resp.shift?.status,
        shift_color: user_shift_resp.shift?.shift_color,
        client_id: user_shift_resp.shift.client?.client_id,
        client_name: user_shift_resp.shift.client?.client_name,
        user_id: user_shift_resp.user_id,
        lunch_break_start: user_shift_resp.shift?.lunch_break_start,
        lunch_break_end: user_shift_resp.shift?.lunch_break_end,
        user_name: user_shift_resp.user_name,
        shift_id: user_shift_resp.shift_id,
        user_shift_id: user_shift_resp.user_shift_id,
        user_shift_status: user_shift_resp.status,
      };

      return user_shift;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getShiftLegends(): Promise<any> {
    try {
      const shifts = await this.prisma.shift.findMany({
        distinct: ['shift_name'],
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          shift_color: true,
          shift_id: true,
          shift_name: true,
          client_id:true,
          start_time:true,
          end_time:true
        }
      });

      return shifts?.map((e, index) => ({ ...e, sno: index + 1 }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async assignShiftByCode(data: AssignShiftsByCode): Promise<any> {
    try {
      let existingShifts = await this.prisma.shift.findMany({
        where: {
          start_time: { gte: data?.start_date, lte: data?.end_date },
          user_shift: {
            some: { user_id: data?.user_id },
          },
        },
        include: {
          user_shift: true,
        },
      });

      let existingHolidays = await this.holidays.getHoliday(
        '',
        moment(data?.start_date).utc().add(1,"day").startOf("day").toISOString(),
        moment(data?.end_date).utc().startOf("day").toISOString(),
        null,
        null,
        null,
        data?.user_id,
      );

      const totalHolidays = [];
      totalHolidays.push(...existingHolidays?.Holidays?.HOLIDAY);
      if (existingHolidays?.Holidays?.WEEKOFF?.Normal) {
        totalHolidays.push(...existingHolidays?.Holidays?.WEEKOFF?.Normal);
      }
      if (existingHolidays?.Holidays?.HOLIDAY?.Edited) {
        totalHolidays.push(...existingHolidays?.Holidays?.WEEKOFF?.Edited);
      }

      await this.deleteHolidaysBetweenDates(
        data?.start_date,
        data?.end_date,
        totalHolidays,
        data?.user_id,
      );

      // check for empty holidays -----------
      existingHolidays = await this.prisma.holiday.findMany({
        where: {
          holiday_id: {
            in: totalHolidays?.map(e => e?.holiday_id),
          },
        },
        include: {
          user_holiday: true,
        },
      });

      const holidaysToDelete = existingHolidays
        ?.filter(holiday => holiday?.user_holiday.length === 0)
        .map(holiday => holiday?.holiday_id);

      if (holidaysToDelete.length > 0) {
        await this.prisma.handlePrismaError(
          this.prisma.holiday.deleteMany({
            where: {
              holiday_id: {
                in: holidaysToDelete,
              },
            },
          }),
        );
      }

      // delete the existing user shifts -----------
      await this.prisma.handlePrismaError(
        this.prisma.user_shift.deleteMany({
          where: {
            shift_id: {
              in: existingShifts?.map(e => e?.shift_id),
            },
            user_id: data?.user_id,
          },
        }),
      );

      // also delete empty existing shifts
      existingShifts = await this.prisma.shift.findMany({
        where: {
          shift_id: {
            in: existingShifts?.map(e => e?.shift_id),
          },
        },
        include: {
          user_shift: true,
        },
      });

      const shiftsToDelete = existingShifts
        ?.filter(shift => shift?.user_shift.length === 0)
        .map(shift => shift?.shift_id);

      if (shiftsToDelete.length > 0) {
        await this.prisma.handlePrismaError(
          this.prisma.shift.deleteMany({
            where: {
              shift_id: {
                in: shiftsToDelete,
              },
            },
          }),
        );
      }

      // if only delete shift is asked then delete one and create holidays for the same --------
      if (data?.delete_shift) {
        const currentDate = moment(data?.start_date).utc()?.clone();
        while (currentDate.isBefore(data?.end_date, 'day')) {
          let holiday = await this.prisma.holiday.findFirst({
            where: {
              holiday_date: moment(currentDate, 'YYYY-MM-DD')
                .add(1, 'day')
                .startOf('day')
                .toDate(),
              holiday_type: 'WEEKOFF_NON_REPEAT',
            },
          });


          if (!holiday) {
            holiday = await this.prisma.handlePrismaError(
              this.prisma.holiday.create({
                data: {
                  holiday_name: 'Weekday off',
                  holiday_date: moment(currentDate, 'YYYY-MM-DD')
                    .add(1, 'day')
                    .startOf('day')
                    .toDate(),
                  holiday_type: 'WEEKOFF_NON_REPEAT',
                },
              }),
            );
          }

          await this.prisma.handlePrismaError(
            this.prisma.user_holiday.create({
              data: {
                user_id: data.user_id,
                holiday_id: holiday.holiday_id,
              },
            }),
          );

          currentDate.add(1, 'day');
        }
      }

      // asked to delete as well as create shift --------------
      else {
        // finding/creating shifts for remaining seleccted days ----------
        const originalShift = await this.prisma.shift.findFirst({
          where: {
            shift_name: data?.shift_name,
            parent_repeat_shift: false,
          },
          orderBy: {
            start_time: 'asc',
          },
        });

        const DaysGap =
          new Date(originalShift?.end_time).getUTCDate() -
          new Date(originalShift?.start_time).getUTCDate();

        const currentDate = moment(data?.start_date).utc()?.clone();
        while (currentDate.isBefore(data?.end_date, 'day')) {
          const isTimeAfter1830 =
            originalShift?.start_time.getUTCHours() * 60 +
              originalShift?.start_time.getUTCMinutes() >
            18 * 60 + 30;
          let startCheck = null;
          let endCheck = null;

          // times before 18:30 utc need to be handled seperately by adding a day in currentdate --------------
          if (isTimeAfter1830) {
            startCheck = moment(currentDate)
              .set({
                hour: originalShift?.start_time.getUTCHours(),
                minute: originalShift?.start_time.getUTCMinutes(),
                second: originalShift?.start_time.getUTCSeconds(),
              })
              .toDate();
            endCheck = moment(currentDate)
              .utc()
              .add(DaysGap, 'day')
              .set({
                hour: originalShift?.end_time.getUTCHours(),
                minute: originalShift?.end_time.getUTCMinutes(),
                second: originalShift?.end_time.getUTCSeconds(),
              })
              .toDate();
          } else {
            startCheck = moment(currentDate)
              .add(1, 'day')
              .set({
                hour: originalShift?.start_time.getUTCHours(),
                minute: originalShift?.start_time.getUTCMinutes(),
                second: originalShift?.start_time.getUTCSeconds(),
              })
              .toDate();
            endCheck = moment(currentDate)
              .add(1 + DaysGap, 'day')
              .utc()
              .set({
                hour: originalShift?.end_time.getUTCHours(),
                minute: originalShift?.end_time.getUTCMinutes(),
                second: originalShift?.end_time.getUTCSeconds(),
              })
              .toDate();
          }

          const shift = await this.prisma.shift.findFirst({
            where: {
              shift_name: data?.shift_name,
              start_time: startCheck,
              end_time: endCheck,
              parent_repeat_shift: false,
            },
          });

          if (shift) {
            await this.prisma.handlePrismaError(
              this.prisma.user_shift.create({
                data: {
                  user_id: data?.user_id,
                  shift_id: shift?.shift_id,
                },
              }),
            );
          } else {
            await this.prisma.handlePrismaError(
              this.prisma.shift.create({
                data: {
                  ...originalShift,
                  shift_id: randomUUID(),
                  start_time: startCheck,
                  end_time: endCheck,
                  user_shift: {
                    create: {
                      user_id: data?.user_id,
                    },
                  },
                },
              }),
            );
          }

          currentDate.add(1, 'day');
        }
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteHolidaysBetweenDates(
    fromDate: Date,
    toDate: Date,
    Holidays: Holiday[],
    user_id: string,
  ): Promise<any> {
    try {
      const weekoffs = Holidays?.filter(e => e.holiday_type === 'WEEKOFF');
      const weekoffToDelete: any = {};
      
      // delete non weekoffs
      await this.prisma.handlePrismaError(
        this.prisma.user_holiday.deleteMany({
          where: {
            holiday_id: {
              in: Holidays
                ?.filter(e => e?.holiday_type !== 'WEEKOFF')
                ?.map(e => e?.holiday_id),
            },
            user_id: user_id,
          },
        }),
      );

      const currentDate = moment(fromDate).add(1, 'day').utc()?.clone();
      while (currentDate.isSameOrBefore(toDate, 'day')) {
        const day = moment(currentDate).format('dddd');

        for (let index = 0; index < weekoffs.length; index++) {
          const element = weekoffs[index];
          if (element.custom_repeat.includes(day)) {
            if (weekoffToDelete.hasOwnProperty(element?.holiday_id)) {
              weekoffToDelete[element?.holiday_id] = [
                ...weekoffToDelete[element?.holiday_id],
                currentDate.startOf('day').toDate(),
              ];
            } else {
              weekoffToDelete[element?.holiday_id] = [
                currentDate.startOf('day').toDate(),
              ];
            }
          }
        }

        currentDate.add(1, 'day');
      }

      // edit this weekoffs ----------
      for (let index = 0; index < Object.keys(weekoffToDelete)?.length; index++) {
        const element = Object.keys(weekoffToDelete)[index];

        const holidayData = await this.prisma.holiday.findUnique({
          where: { holiday_id: element },
          include: {
            user_holiday: true,
          },
        });

        const user_holidays = holidayData?.user_holiday?.filter(
          e => e?.user_id !== user_id,
        );

        for (let index = 0; index < weekoffToDelete[element].length; index++) {
          const date = weekoffToDelete[element][index];
          const checkEdited = await this.prisma.holiday.findFirst({
            where: {
              status: 'Edited',
              repeatId: holidayData.holiday_id,
              holiday_date: moment(date, 'YYYY-MM-DD').format(
                'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
              ),
            },
            include: { user_holiday: true },
          });

          if (checkEdited) {
            await this.prisma.handlePrismaError(
              this.prisma.user_holiday.deleteMany({
                where: { holiday_id: checkEdited?.holiday_id, user_id: user_id },
              }),
            );
          } else {
            await this.prisma.handlePrismaError(
              this.prisma.holiday.create({
                data: {
                  holiday_name: holidayData.holiday_name,
                  holiday_date: moment(date, 'YYYY-MM-DD').format(
                    'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
                  ),
                  holiday_type: holidayData.holiday_type,
                  custom_repeat: holidayData.custom_repeat,
                  status: 'Edited',
                  repeatId: holidayData.holiday_id,
                  user_holiday: {
                    createMany: {
                      data: user_holidays?.map(e => ({
                        user_id: e?.user_id,
                      })),
                    },
                  },
                },
              }),
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
