import { PrismaService } from 'src/prisma.service';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as moment from 'moment';
import { User } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async live_report() {
    try {
      let present = 0,
        absent = 0,
        late = 0,
        expected = 0;

      let start_time = moment().startOf('day').utc().toDate();
      let end_time = moment().endOf('day').utc().toDate();

      let result = await this.prisma.shift.findMany({
        where: {
          parent_repeat_shift: false,
          end_time: {
            gte: start_time,
            lte: end_time,
          },
        },
        select: {
          shift_id: true,
          start_time: true,
          end_time: true,
          user_shift: {
            select: {
              user_id: true,
            },
          },
        },
      });

      for (let shift of result) {
        for (let user in shift.user_shift) {
          //find if the checkin exist
          let checkin = await this.prisma.checkin.findFirst({
            where: {
              shift_id: shift.shift_id,
              user_id: shift.user_shift[user].user_id,
            },
          });

          if (!checkin) {
            absent++;
          } else if (
            moment(checkin.log_time).diff(moment(shift.start_time).add(15, 'minute')) >
            0
          ) {
            late++;
          } else {
            present++;
          }
          expected++;
        }
      }

      return { present, absent, late, expected };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAttendance(startDate: string, endDate: string) {
    try {
      let present = 0,
        absent = 0,
        half_day = 0,
        onleave = 0,
        expected = 0;

      let result = await this.prisma.shift.findMany({
        where: {
          parent_repeat_shift: false,
          AND: [
            {
              start_time: {
                gte: new Date(startDate),
              },
            },
            {
              end_time: {
                lte: new Date(endDate),
              },
            },
          ],
        },
        select: {
          shift_id: true,
          start_time: true,
          end_time: true,
          user_shift: {
            select: {
              user_id: true,
            },
          },
        },
      });

      for (let shift of result) {
        for (let user in shift.user_shift) {
          //find if the attendance exist
          let attendance = await this.prisma.attendance.findFirst({
            where: {
              shift_id: shift.shift_id,
              user_id: shift.user_shift[user].user_id,
            },
          });

          if (attendance) {
            if (attendance.status == 'PRESENT') {
              present++;
            } else if (attendance.status == 'ABSENT') {
              absent++;
            } else if (attendance.status == 'HALF_DAY') {
              half_day++;
            } else if (
              ['SICK', 'EARNED', 'CASUAL', 'COMPUNSATORY', 'UNPAID'].includes(
                attendance.status,
              )
            ) {
              onleave++;
            }
          }
        }
      }
      return { present, absent, half_day, onleave, expected };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async clientReport(clientId: string) {
    try {
      const client = await this.prisma.client.findUnique({
        where: {
          client_id: clientId,
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      const shifts = await this.prisma.shift.findMany({
        where: {
          client_id: clientId,
        },
        select: {
          shift_id: true,
          shift_name: true,
          user_shift: {
            select: {
              user: {
                select: {
                  user_id: true,
                  user_name: true,
                },
              },
            },
          },
        },
      });

      //night hours start;
      const night_hour_start = moment(client.night_hour_start).format('HH:mm:ss');
      const night_hour_end = moment(client.day_hour_start).format('HH:mm:ss');

      //day hours start;
      const day_hour_start = moment(client.day_hour_start).format('HH:mm:ss');
      const day_hour_end = moment(client.night_hour_start).format('HH:mm:ss');

      let users: any = [];
      let night_hours = 0,
        day_hours = 0;

      for (let shift of shifts) {
        for (let user in shift.user_shift) {
          let attendance = await this.prisma.attendance.findMany({
            where: {
              shift_id: shift.shift_id,
              user_id: shift.user_shift[user].user.user_id,
            },
            include: {
              checkin: {
                select: {
                  log_time: true,
                },
              },
            },
          });

          for (let attend in attendance) {
            if (
              attendance[attend].status == 'PRESENT' ||
              attendance[attend].status == 'HALF_DAY'
            ) {
              const checkinMoment = moment(
                attendance[attend].checkin[0].log_time,
              ).format('HH:mm:ss');
              const checkoutMoment = moment(
                attendance[attend].checkin[1].log_time,
              ).format('HH:mm:ss');

              let work_day_hours = undefined;
              let work_night_hours = undefined;
              let shift_type = undefined;

              if (
                moment(checkinMoment).isBetween(night_hour_start, night_hour_end) &&
                moment(checkoutMoment).isBetween(night_hour_start, night_hour_end)
              ) {
                work_night_hours = moment(checkoutMoment).diff(checkinMoment, 'hours');
                night_hours += work_night_hours;
                shift_type = 'Night Shift';
              } else if (
                moment(checkinMoment).isBetween(day_hour_start, day_hour_end) &&
                moment(checkoutMoment).isBetween(day_hour_start, day_hour_end)
              ) {
                work_day_hours = moment(checkoutMoment).diff(checkinMoment, 'hours');
                day_hours += work_day_hours;
                shift_type = 'Day Shift';
              } else {
                if (
                  moment(checkinMoment).isAfter(night_hour_start) &&
                  moment(checkinMoment).isBefore(night_hour_end)
                ) {
                  work_night_hours = moment(night_hour_end).diff(
                    checkinMoment,
                    'hours',
                  );
                  night_hours += work_night_hours;
                } else if (
                  moment(checkinMoment).isAfter(day_hour_start) &&
                  moment(checkinMoment).isBefore(day_hour_end)
                ) {
                  work_day_hours = moment(day_hour_end).diff(checkinMoment, 'hours');
                  day_hours += work_day_hours;
                }
                shift_type = 'Day/Night Shift';
              }

              users.push({
                user_id: shift.user_shift[user].user.user_id,
                user_name: shift.user_shift[user].user.user_name,
                shift_id: shift.shift_id,
                shift_name: shift.shift_name,
                work_day_hours,
                work_night_hours,
                shift_type,
              });
            }
          }
        }
      }

      return {
        night_hours,
        day_hours,
        users,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async live_employee_info(userId: string) {
    try {
      let all_employees: any;

      if (userId) {
        all_employees = await this.prisma.user.findMany({
          where: {
            status: 'Active',
            user_id: userId,
          },
          include: {
            user_shift: {
              include: {
                shift: {
                  select: {
                    shift_id: true,
                    start_time: true,
                    end_time: true,
                    shift_name: true,
                    client: {
                      select: {
                        client_name: true,
                        client_id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else {
        all_employees = await this.prisma.user.findMany({
          // where: {
          //   user_shift : {
          //     some: {
          //       shift: {
          //         end_time: {
          //           gte: new Date()
          //         }
          //       }
          //     }
          //   }
          // },
          where: {
            status: 'Active',
          },
          include: {
            user_shift: {
              include: {
                shift: {
                  select: {
                    shift_id: true,
                    start_time: true,
                    end_time: true,
                    shift_name: true,
                    client: {
                      select: {
                        client_name: true,
                        client_id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      const data = [];

      for (let user of all_employees) {
        let current_shift: any = {};
        let upcoming_shift: any = {};
        let on_leave: boolean = false;
        let is_late: boolean = false;

        let max_time = moment().add(1, 'month').utc().toDate();

        for (let ushift of user.user_shift) {
          if (
            moment(ushift.shift.start_time).isBefore(moment()) &&
            moment(ushift.shift.end_time).isAfter(moment().subtract(12, 'hours'))
          ) {
            const checkin = await this.prisma.checkin.findFirst({
              where: {
                shift_id: ushift.shift.shift_id,
                user_id: user.user_id,
                log_type: 'IN',
              },
              select: {
                log_time: true,
              },
            });

            const checkout = await this.prisma.checkin.findFirst({
              where: {
                shift_id: ushift.shift.shift_id,
                user_id: user.user_id,
                log_type: 'OUT',
              },
              select: {
                log_time: true,
              },
            });

            current_shift.shift_id = ushift.shift.shift_id;
            current_shift.shift_name = ushift.shift.shift_name;
            current_shift.start_time = ushift.shift.start_time;
            current_shift.end_time = ushift.shift.end_time;
            current_shift.user_shift_id = ushift.user_shift_id;
            current_shift.client_name = ushift.shift.client
              ? ushift.shift.client.client_name
              : null;
            current_shift.client_id = ushift.shift.client
              ? ushift.shift.client.client_id
              : null;
            current_shift.user_checkin =
              checkin && checkin.log_time ? checkin.log_time : null;
            current_shift.user_checkout =
              checkout && checkout.log_time ? checkout.log_time : null;

            break;
          } else if (
            moment(ushift.shift.start_time).isBefore(max_time) &&
            moment(ushift.shift.start_time).isAfter(moment())
          ) {
            max_time = ushift.shift.start_time;
            upcoming_shift.shift_id = ushift.shift.shift_id;
            upcoming_shift.shift_name = ushift.shift.shift_name;
            upcoming_shift.start_time = ushift.shift.start_time;
            upcoming_shift.end_time = ushift.shift.end_time;
            upcoming_shift.user_shift_id = ushift.user_shift_id;
            upcoming_shift.client_name = ushift.shift.client
              ? ushift.shift.client.client_name
              : null;
            upcoming_shift.client_id = ushift.shift.client
              ? ushift.shift.client.client_id
              : null;
          }
        }
        //check if user on leave
        const leave = await this.prisma.leave.count({
          where: {
            user_id: user.user_id,
            AND: [
              {
                leave_start_date: {
                  lte: moment().utc().toDate(),
                },
              },
              {
                leave_end_date: {
                  gte: moment().utc().toDate(),
                },
              },
            ],
          },
        });

        if (leave > 0) {
          on_leave = true;
        }

        if (current_shift.user_checkin) {
          is_late =
            moment(current_shift.user_checkin).diff(
              moment(current_shift.start_time),
              'minutes',
            ) > 20
              ? true
              : false;
        }

        if (!current_shift.shift_id) current_shift = null;
        if (!upcoming_shift.shift_id) upcoming_shift = null;

        let obj: any = {
          user_id: user.user_id,
          user_name: user.user_name,
          profile_photo: user.profile_photo,
          user_email: user.user_email,
          current_shift: current_shift,
          upcoming_shift: upcoming_shift,
          on_leave: on_leave,
          is_late: is_late,
        };

        data.push(obj);
      }

      return data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
