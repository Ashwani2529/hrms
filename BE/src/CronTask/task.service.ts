import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { AttendanceService } from 'src/Attendance/attendance.service';
import * as moment from 'moment';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private attendanceService: AttendanceService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async Unexpected_Leave_Handle_CRON() {
    const shifts = await this.prisma.shift.findMany({
      where: {
        start_time: {
          gte: moment().subtract(20, 'minute').startOf('minute').utc().toDate(),
          lte: moment().subtract(20, 'minute').endOf('minute').utc().toDate(),
        },
      },
    });

    for (let shift of shifts) {
      const all_employess = await this.prisma.user_shift.findMany({
        where: {
          shift_id: shift.shift_id,
        },
      });

      for (let emp of all_employess) {
        const checkIn = await this.prisma.checkin.findFirst({
          where: {
            shift_id: shift.shift_id,
            user_id: emp.user_id,
          },
        });

        if (!checkIn) {
          await this.prisma.handlePrismaError(this.prisma.shift.update({
            where: {
              shift_id: shift.shift_id,
            },
            data: {
              status: 'Unexpected',
            },
          }));
          break;
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async Auto_Attendance_CRON() {
    try {
      const shifts = await this.prisma.shift.findMany({
        where: {
          auto_attendance: true,
          parent_repeat_shift: false,
          end_time: {
            gte: moment().subtract(12, 'hours').toDate(),
            lt: moment().toDate(),
          },
        },
        select: {
          shift_id: true,
        },
      });

      for (let shift of shifts) {
        this.logger.debug(`Shift ${shift.shift_id} Auto-Attendance Check`);
        await this.attendanceService.autoAttendance(shift.shift_id);
      }
    } catch (error) {
      this.logger.error(`Error in Auto_Attendance_CRON ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async Auto_Shift_Repeat_CRON() {
    try {
      const shifts = await this.prisma.shift.findMany({
        where: {
          start_time: {
            gte: moment().subtract(24, 'hours').toDate(),
            lt: moment().toDate(),
          },
        },
      });

      for (let shift of shifts) {
        this.logger.debug(`Shift ${shift.shift_id} Auto-Repeat Check`);

        if (shift.repeat === 'None') continue;

        const parent_shift = await this.prisma.shift.findFirst({
          where: {
            repeat_id: shift.repeat_id,
            parent_repeat_shift: true,
          },
          include: {
            user_shift: {
              select: {
                user_id: true,
              },
            },
          },
        });

        if (!parent_shift) {
          this.logger.debug(`Parent Shift not found for ${shift.shift_id} child`);
          continue;
        }

        const shift_creation =  await this.prisma.handlePrismaError(this.prisma.shift.create({
          data: {
            shift_name: parent_shift.shift_name,
            begin_checkin: parent_shift.begin_checkin,
            begin_checkout: parent_shift.begin_checkout,
            auto_attendance: parent_shift.auto_attendance,
            shift_color: parent_shift.shift_color,
            client_id: parent_shift.client_id,
            status: parent_shift.status,
            lunch_break_start: parent_shift.lunch_break_start,
            lunch_break_end: parent_shift.lunch_break_end,
            repeat: parent_shift.repeat,
            repeat_id: parent_shift.repeat_id,
            start_time: moment(shift.start_time).add(28, 'days').toDate(),
            end_time: moment(shift.end_time).add(28, 'days').toDate(),
          },
        }));

        for (const user of parent_shift.user_shift) {
          //check if the user exist or not in the company
          const user_exist = await this.prisma.user.findFirst({
            where: {
              user_id: user.user_id,
            },
          });

          if (!user_exist) {
            this.logger.debug(`User ${user.user_id} not found`);
            continue;
          }

          await this.prisma.handlePrismaError(this.prisma.user_shift.create({
            data: {
              user_id: user.user_id,
              shift_id: shift_creation.shift_id,
            },
          }));
        }
      }
    } catch (error) {
      this.logger.error(`Error in Auto_Shift_Repeat_CRON ${error}`);
    }
  }

  // Earned leave logic ------------------
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async Auto_Paid_leave_update() {
    try {
      const all_users = await this.prisma.user.findMany({
        where: {
          status: 'Active',
        },
      });

      for (const user of all_users) {
        const attendence_of_user: number = await this.prisma.attendance.count({
          where: {
            user_id: user?.user_id,
            status: {
              in: ['PRESENT', 'HALF_DAY'],
            },
          },
        });

        const multiple_of_20 =
          attendence_of_user % 20 == 0 && user.last_check_point !== attendence_of_user
            ? 1
            : 0;

            await this.prisma.handlePrismaError(this.prisma.user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            earned_leaves: user.earned_leaves + multiple_of_20,
            last_check_point: attendence_of_user,
          },
        }));
      }
    } catch (error) {
      this.logger.error(`Error in Auto_Paid_leave_update ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async Garbage_Collection_CRON() {
    try {
      const find_parent_shifts = await this.prisma.shift.findMany({
        where: {
          parent_repeat_shift: true,
        },
        select: {
          shift_id: true,
        },
      });

      for (const shift of find_parent_shifts) {
        const find_child_shifts = await this.prisma.shift.findMany({
          where: {
            repeat_id: shift.shift_id,
            parent_repeat_shift: false,
          },
          select: {
            shift_id: true,
          },
        });

        if (find_child_shifts.length === 0) {
          this.logger.debug(`Deleting Parent Shift ${shift.shift_id}`);
          await this.prisma.handlePrismaError(this.prisma.user_shift.deleteMany({
            where: {
              shift_id: shift.shift_id,
            },
          }));
          await this.prisma.handlePrismaError(this.prisma.shift.delete({
            where: {
              shift_id: shift.shift_id,
            },
          }));
        }
      }
    } catch (error) {
      this.logger.error(`Error in Garbage_Collection_CRON ${error}`);
    }
  }

  @Cron('59 23 31 3 *')
  async Leave_Reset_CRON() {
    try {
      const all_users = await this.prisma.user.findMany();
      const currentDate = new Date();
      let startOfFinancialYear;
      let endOfFinancialYear;

      if (currentDate.getMonth() + 1 >= 4) {
        // Financial year starts in the current year
        startOfFinancialYear = new Date(currentDate.getFullYear(), 3, 1); // April 1st of the current year
        endOfFinancialYear = new Date(currentDate.getFullYear() + 1, 2, 31, 23, 59, 59); // March 31st of the next year
      } else {
        // Financial year started in the previous year
        startOfFinancialYear = new Date(currentDate.getFullYear() - 1, 3, 1); // April 1st of the previous year
        endOfFinancialYear = new Date(currentDate.getFullYear(), 2, 31, 23, 59, 59); // March 31st of the current year
      }

      for (const user of all_users) {
        let leaves_reset_values: any = user?.leaves_reset_values;
        let totalUsed = await this.prisma.leave.aggregate({
          _sum:{
            debit_amt: true
          },
          where: {
            user_id: user?.user_id,
            trans_status:"DEBIT",
            leave_status:{notIn:["LAPSED","REJECTED"]},
            createdAt: {
              gte: startOfFinancialYear,
              lte: endOfFinancialYear,
            },
          }
        });
  
        let totalCredited = await this.prisma.leave.aggregate({
          _sum:{
            credit_amt: true
          },
          where: {
            user_id: user?.user_id,
            leave_status:{not:"REFUNDED"},
            trans_status:"CREDIT",
            createdAt: {
              gte: startOfFinancialYear,
              lte: endOfFinancialYear,
            },
          }
        });
        let remaining=totalCredited?._sum?.credit_amt - totalUsed?._sum?.debit_amt;

        await this.prisma.handlePrismaError(this.prisma.user.update({
          where: {
            user_id: user.user_id,
          },
          data: {
            casual_leaves: leaves_reset_values?.casual_leaves,
            sick_leaves: leaves_reset_values?.sick_leaves,
            unpaid_leaves: leaves_reset_values?.unpaid_leaves,
            lapsed_leaves: remaining
          },
        }));
      }
    } catch (error) {
      this.logger.error(`Error in Leave_Reset_cron ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async Logger_detailing_CRON() {
    try {
      const logs = await this.prisma.logger.findMany({
        where: {
          text_info: { equals: null },
        },
      });

      for (let index = 0; index < logs.length; index++) {
        const element = logs[index];

        const doerData = await this.prisma.user.findUnique({
          where: { user_id: element?.user_id },
          include: {
            role: {
              select: {
                role_name: true,
              },
            },
          },
        });

        let textInfo: string = null;

        switch (element?.Entity_name) {
          case 'SHIFT':
            switch (element?.log_type) {
              case 'Create':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const shiftData = await this.prisma.shift.findUnique({
                    where: { shift_id: element?.attrib_id[index] },
                    include: {
                      user_shift: {
                        include: {
                          user: {
                            select: {
                              user_name: true,
                              user_id: true,
                            },
                          },
                        },
                      },
                    },
                  });

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} a new SHIFT ${shiftData?.shift_name} from time ${shiftData?.start_time} to ${shiftData?.end_time}`;
                }
                break;

              case 'Update':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const shiftData = await this.prisma.shift.findUnique({
                    where: { shift_id: element?.attrib_id[index] },
                    include: {
                      user_shift: {
                        include: {
                          user: {
                            select: {
                              user_name: true,
                              user_id: true,
                            },
                          },
                        },
                      },
                    },
                  });

                  if (element?.updateData) {
                    textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} SHIFT ${shiftData?.shift_name} to data: ${Object.keys(
                      element?.updateData,
                    )?.map(e => `${e} to ${element?.updateData[e]}`)}`;
                  } else {
                    textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} SHIFT ${shiftData?.shift_name}`;
                  }
                }
                break;

              case 'Delete':
                textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} ${element?.attrib_id?.length} Shifts with ids ${element?.attrib_id}`;

                break;

              default:
                break;
            }
            break;

          case 'ATTENDANCE':
            switch (element?.log_type) {
              case 'Create':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const attendanceData = await this.prisma.attendance.findUnique({
                    where: { attendance_id: element?.attrib_id[index] },
                    include: {
                      user: true,
                    },
                  });

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} a manual Attendance for user ${attendanceData?.user?.user_name} for date ${attendanceData?.attendance_date}`;
                }

                break;

              case 'Update':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const attendanceData = await this.prisma.attendance.findUnique({
                    where: { attendance_id: element?.attrib_id[index] },
                    include: {
                      user: true,
                    },
                  });

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} the Attendance for user ${attendanceData?.user?.user_name} to data: ${Object.keys(
                    element?.updateData,
                  )?.map(e => `${e} to ${element?.updateData[e]}`)}`;
                }

                break;

              case 'Delete':
                textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} ${element?.attrib_id?.length} Attendance with ids ${element?.attrib_id}`;

                break;

              default:
                break;
            }

          case 'HOLIDAY':
            switch (element?.log_type) {
              case 'Create':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const holidayData = await this.prisma.holiday.findUnique({
                    where: { holiday_id: element?.attrib_id[index] },
                    include: {
                      user_holiday: {
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

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} a ${holidayData?.holiday_type} for users ${holidayData?.user_holiday?.map(user => user?.user?.user_name)?.join(',')} on date ${holidayData?.holiday_date} `;
                }

                break;

              case 'Update':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const holidayData = await this.prisma.holiday.findUnique({
                    where: { holiday_id: element?.attrib_id[index] },
                    include: {
                      user_holiday: {
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

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} the ${holidayData?.holiday_type} for users ${holidayData?.user_holiday?.map(user => user?.user?.user_name)?.join(',')} to data: ${Object.keys(
                    element?.updateData,
                  )?.map(e => `${e} to ${element?.updateData[e]}`)}`;
                }

                break;

              case 'Delete':
                textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} ${element?.attrib_id?.length} holiday with ids ${element?.attrib_id}`;

                break;

              default:
                break;
            }

          case 'LEAVE':
            switch (element?.log_type) {
              case 'Create':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const leaveData = await this.prisma.leave.findUnique({
                    where: { leave_id: element?.attrib_id[index] },
                    include: {
                      user: true,
                    },
                  });

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} a ${leaveData?.leave_type} for user ${leaveData?.user?.user_name} from date ${leaveData?.leave_start_date} to date ${leaveData?.leave_end_date} `;
                }

                break;

              case 'Update':
                for (let index = 0; index < element?.attrib_id.length; index++) {
                  const leaveData = await this.prisma.leave.findUnique({
                    where: { leave_id: element?.attrib_id[index] },
                    include: {
                      user: true,
                    },
                  });

                  textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} a ${leaveData?.leave_type} for user ${leaveData?.user?.user_name} to data: ${Object.keys(
                    element?.updateData,
                  )?.map(e => `${e} to ${element?.updateData[e]}`)}`;
                }

                break;

              case 'Delete':
                textInfo = `${doerData?.role?.role_name} ${doerData?.user_name} ${element?.actionName} ${element?.attrib_id?.length} leaves with ids ${element?.attrib_id}`;

                break;

              default:
                break;
            }

          default:
            break;
        }

        await this.prisma.handlePrismaError(this.prisma.logger.update({
          where: { logger_id: element?.logger_id },
          data: {
            text_info: textInfo,
          },
        }));
      }
    } catch (error) {}
  }
}
