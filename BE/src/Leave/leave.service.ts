import { PrismaService } from 'src/prisma.service';
import {
  LEAVE_STATUS,
  LEAVE_TYPE,
  Leave,
  User_shift,
  TRANS_STATUS,
} from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLeave, DeleteLeave, UpdateLeave } from './dto/leave.dto';
import * as moment from 'moment';
import { NotificationGateway } from 'src/Notification/gateway/notification.gateway';

@Injectable()
export class LeaveService {
  constructor(
    private notiGate: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async getAllWithInfo(
    search: string,
    startDate: string,
    endDate: string,
    type: string,
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
              user_email: true,
              profile_photo: true,
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
            leave_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        trans_status: 'DEBIT',
      };

      // if user id is given -----------
      if (userId) {
        where.user_id = userId;
      }

      if (startDate && endDate) {
        where = {
          ...where,
          AND: [
            { leave_start_date: { gte: new Date(startDate) } },
            { leave_start_date: { lte: new Date(endDate) } },
          ],
        };
      } else if (startDate) {
        where.leave_start_date = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
        where.leave_end_date = {
          lte: new Date(endDate),
        };
      }

      if (type) where.leave_type = type as LEAVE_TYPE;
      if (status) where.leave_status = status as LEAVE_STATUS;
      query.where = where;

      const totalLeaves = await this.prisma.leave.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const leaves = await this.prisma.leave.findMany(query);

      return { leaves, totalLeaves };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAll(
    search: string,
    startDate: string,
    endDate: string,
    type: string,
    status: string,
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
            leave_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
        trans_status: 'DEBIT',
      };

      // if user id is given -----------
      if (userId) {
        where.user_id = userId;
      }

      if (startDate) {
        where.leave_start_date = {
          gte: new Date(startDate),
        };
      }
      if (endDate) {
        where.leave_end_date = {
          lte: new Date(endDate),
        };
      }

      if (type) where.leave_type = type as LEAVE_TYPE;
      if (status) where.leave_status = status as LEAVE_STATUS;
      query.where = where;

      const totalLeaves = await this.prisma.leave.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const leaves = await this.prisma.leave.findMany(query);

      return { leaves, totalLeaves };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getLeavesStats(userId: string): Promise<any> {
    try {
      // current financial year --------
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

      const user = await this.prisma.user.findUnique({
        where: { user_id: userId },
      });

      const allLeavesTransaction = await this.prisma.leave.findMany({
        where: {
          user_id: userId,
          createdAt: {
            gte: startOfFinancialYear,
            lte: endOfFinancialYear,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const finalLeavesLists = [];

      allLeavesTransaction?.forEach((transaction, i) => {
        finalLeavesLists.push({
          ...transaction,
          balance:
            i === 0
              ? transaction.trans_status === 'DEBIT'
                ? -transaction?.debit_amt
                : transaction?.credit_amt
              : (finalLeavesLists[i - 1]?.balance ?? 0) +
                (transaction.trans_status === 'DEBIT'
                  ? -transaction?.debit_amt
                  : transaction?.credit_amt),
        });
      });

      //remove rejected leaves from final list
      finalLeavesLists.forEach((leave, i) => {
        if (leave.leave_status === 'REJECTED') {
          finalLeavesLists.splice(i, 1);
        }
      });

      const totalUsed = await this.prisma.leave.aggregate({
        _sum: {
          debit_amt: true,
        },
        where: {
          user_id: userId,
          trans_status: 'DEBIT',
          leave_status: { notIn: ['LAPSED', 'REJECTED'] },
          createdAt: {
            gte: startOfFinancialYear,
            lte: endOfFinancialYear,
          },
        },
      });
      const pending = await this.prisma.leave.aggregate({
        _sum: {
          debit_amt: true,
        },
        where: {
          user_id: userId,
          trans_status: 'DEBIT',
          leave_status: 'PENDING',
          createdAt: {
            gte: startOfFinancialYear,
            lte: endOfFinancialYear,
          },
        },
      });

      const totalCredited = await this.prisma.leave.aggregate({
        _sum: {
          credit_amt: true,
        },
        where: {
          user_id: userId,
          leave_status: { not: 'REFUNDED' },
          trans_status: 'CREDIT',
          createdAt: {
            gte: startOfFinancialYear,
            lte: endOfFinancialYear,
          },
        },
      });

      // const total_complementaryLeaves = await this.prisma.complementary_Leave.aggregate(
      //   {
      //     _sum: {
      //       no_of_leaves: true,
      //     },
      //     where: {
      //       createdAt: {
      //         gte: startOfFinancialYear,
      //         lte: endOfFinancialYear,
      //       },
      //     },
      //   },
      // );

      // // compunsatory off logic -----------------
      // const available_complementary_leaves =
      //   await this.prisma.complementary_Leave.aggregate({
      //     _sum: {
      //       no_of_leaves: true,
      //     },
      //     where: {
      //       expired_At: { gt: new Date() },
      //       createdAt: {
      //         gte: startOfFinancialYear,
      //         lte: endOfFinancialYear,
      //       },
      //     },
      //   });

      return {
        casual_leaves: user.casual_leaves,
        sick_leaves: user.sick_leaves,
        compunsatory_leaves: 0,
        earned_leaves: user?.earned_leaves,
        pending_leaves: pending?._sum?.debit_amt || 0,
        unpaid_leaves: user?.unpaid_leaves,
        totalData: totalCredited?._sum?.credit_amt,
        usedLeaves: totalUsed?._sum?.debit_amt,
        remaining: totalCredited?._sum?.credit_amt - totalUsed?._sum?.debit_amt,
        leaveHistory: finalLeavesLists.reverse(),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string, userId: string): Promise<Leave> {
    try {
      const leave = await this.prisma.leave.findUnique({
        where: { leave_id: id },
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
      });

      if (!leave) {
        throw new NotFoundException('Leave not found.');
      }

      if (userId && leave?.user_id !== userId) {
        throw new ForbiddenException('You are not allowed');
      }

      return leave;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateLeave, userId: string): Promise<Leave> {
    try {
      if (userId && userId !== data?.user_id) {
        throw new ForbiddenException('You are not allowed');
      }

      const leave_days =
        moment(data.leave_end_date).diff(moment(data.leave_start_date), 'days') + 1;

      if (leave_days < 0) {
        throw new ConflictException('Invalid date range');
      }

      const usr = await this.prisma.user.findUnique({
        where: { user_id: data.user_id },
      });

      if (!usr) {
        throw new NotFoundException('User not found.');
      }

      if (data.leave_type) {
        if (usr[`${data.leave_type.toLowerCase()}_leaves`] < leave_days) {
          throw new ConflictException(`Not enough ${data.leave_type} leaves`);
        }

        usr[`${data.leave_type.toLowerCase()}_leaves`] =
          usr[`${data.leave_type.toLowerCase()}_leaves`] - leave_days;
      }

      if (data.leave_start_date) {
        data.leave_start_date = moment(data.leave_start_date, 'YYYY-MM-DD')
          .startOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }
      if (data.leave_end_date) {
        data.leave_end_date = moment(data.leave_end_date, 'YYYY-MM-DD')
          .endOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }

      const [_, leave] = await this.prisma.handlePrismaError(
        this.prisma.$transaction([
          this.prisma.user.update({
            where: { user_id: data.user_id },
            data: {
              casual_leaves: usr.casual_leaves,
              earned_leaves: usr.earned_leaves,
              sick_leaves: usr.sick_leaves,
              compunsatory_leaves: usr.compunsatory_leaves,
              unpaid_leaves: usr.unpaid_leaves,
            },
          }),
          this.prisma.leave.create({
            data: {
              ...data,
              debit_amt: leave_days,
            },
          }),
        ]),
      );

      if (leave.leave_status === 'PENDING') {
        await this.notiGate.handlesSendNotification({
          title: 'Leave Request',
          description: 'Leave Request from ' + usr.user_name,
          notification_type: 'Leave',
          notification_status: 'Pending',
          roles: ['ADMIN', 'HR'],
          userId: null,
        });
      }

      return leave;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateLeave): Promise<Leave> {
    try {
      let ExistingLeave = await this.prisma.leave.findUnique({
        where: { leave_id: id },
      });
      if (!ExistingLeave) {
        throw new NotFoundException('Leave not found.');
      }

      if (ExistingLeave.leave_status === 'REJECTED') {
        throw new NotFoundException('Leave is rejected.');
      }

      let newLeaves: number = 1;

      const exisLeaves =
        moment(ExistingLeave.leave_end_date).diff(
          moment(ExistingLeave.leave_start_date),
          'days',
        ) + 1;

      if (data.leave_start_date) {
        data.leave_start_date = moment(data.leave_start_date, 'YYYY-MM-DD')
          .startOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }
      if (data.leave_end_date) {
        data.leave_end_date = moment(data.leave_end_date, 'YYYY-MM-DD')
          .endOf('day')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      }

      if (data.leave_start_date && data.leave_end_date) {
        newLeaves =
          moment(data.leave_end_date).diff(moment(data.leave_start_date), 'days') + 1;
      }

      const usr = await this.prisma.user.findUnique({
        where: { user_id: data.user_id },
      });

      if (newLeaves && newLeaves != exisLeaves) {
        if (newLeaves < 0) {
          throw new ConflictException('Invalid date range');
        }

        if (data?.leave_type) {
          if (ExistingLeave?.leave_type === data?.leave_type) {
            const changedLeaves =
              usr[`${ExistingLeave.leave_type.toLowerCase()}_leaves`] +
              exisLeaves -
              newLeaves;

            if (changedLeaves < 0) {
              throw new ConflictException(
                `Not enough ${ExistingLeave.leave_type.toLowerCase()} leaves`,
              );
            }

            await this.prisma.handlePrismaError(
              this.prisma.user.update({
                where: { user_id: data.user_id },
                data: {
                  [ExistingLeave?.leave_type.toLowerCase() + '_leaves']: changedLeaves,
                },
              }),
            );
          } else if (ExistingLeave.leave_type !== data?.leave_type) {
            const changedLeaves =
              usr[`${data?.leave_type.toLowerCase()}_leaves`] - newLeaves;

            if (changedLeaves < 0) {
              throw new ConflictException(
                `Not enough ${data?.leave_type?.toLowerCase()} leaves`,
              );
            }

            await this.prisma.handlePrismaError(
              this.prisma.user.update({
                where: { user_id: data.user_id },
                data: {
                  [ExistingLeave?.leave_type.toLowerCase() + '_leaves']:
                    usr[`${ExistingLeave.leave_type.toLowerCase()}_leaves`] +
                    exisLeaves,
                  [data?.leave_type?.toLowerCase() + '_leaves']: changedLeaves,
                },
              }),
            );
          }
        }
      } else {
        if (data?.leave_type && ExistingLeave.leave_type !== data?.leave_type) {
          const changedLeaves =
            usr[`${data?.leave_type.toLowerCase()}_leaves`] - exisLeaves;

          if (changedLeaves < 0) {
            throw new ConflictException(
              `Not enough ${data?.leave_type?.toLowerCase()} leaves`,
            );
          }

          await this.prisma.handlePrismaError(
            this.prisma.user.update({
              where: { user_id: data?.user_id },
              data: {
                [ExistingLeave?.leave_type.toLowerCase() + '_leaves']:
                  usr[`${ExistingLeave.leave_type.toLowerCase()}_leaves`] + exisLeaves,
                [data?.leave_type?.toLowerCase() + '_leaves']: changedLeaves,
              },
            }),
          );
        }
      }

      let transStatus: TRANS_STATUS = null;

      if (data?.leave_status === 'APPROVED') {
        transStatus = TRANS_STATUS.DEBIT;
      }
      if (data?.leave_status === 'REJECTED') {
        transStatus=TRANS_STATUS.CREDIT;
      }
      const leave = await this.prisma.handlePrismaError(
        this.prisma.leave.update({
            where: { leave_id: id },
            data: {
                leave_name: data.leave_name,
                leave_description: data.leave_description,
                leave_type: data.leave_type,
                leave_status: data.leave_status,
                leave_start_date: data.leave_start_date,
                leave_end_date: data.leave_end_date,
                debit_amt: newLeaves,
                trans_status: transStatus,
                user: {
                    connect: { user_id: data.user_id },
                },
            },
        }),
    );

      // give a rejection credit ------------
      if (data?.leave_status === 'REJECTED') {
        await this.prisma.handlePrismaError(
          this.prisma.leave.create({
            data: {
              leave_name: 'Rejection Refund',
              user: {
                connect: { user_id: data.user_id },
              },
              trans_status: 'CREDIT',
              debit_amt: newLeaves,
              leave_type: data?.leave_type,
              leave_status: 'REFUNDED',
            },
          }),
        );
      }

      await this.HandleLeaveStatus(data, leave);

      return leave;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occurred');
    }
  }

  async HandleLeaveStatus(data: UpdateLeave, leave: Leave) {
    try {
      if (data.leave_status && data.leave_status === 'APPROVED') {
        //update shift status
        const all_shifts_of_user = await this.prisma.user_shift.findMany({
          where: {
            user_id: data.user_id,
            shift: {
              OR: [
                {
                  start_time: {
                    gte: new Date(leave.leave_start_date),
                    lte: new Date(leave.leave_end_date),
                  },
                },
                {
                  end_time: {
                    gte: new Date(leave.leave_start_date),
                    lte: new Date(leave.leave_end_date),
                  },
                },
              ],
            },
          },
        });

        const update_user_shift = await this.prisma.handlePrismaError(
          this.prisma.user_shift.updateMany({
            where: {
              user_id: data.user_id,
              shift_id: {
                in: all_shifts_of_user.map(sh => sh.shift_id),
              },
            },
            data: {
              status: 'Leave_Conflict',
            },
          }),
        );

        let shift_array: string[] = all_shifts_of_user.map(sh => sh.shift_id);

        const d = await this.prisma.handlePrismaError(
          this.prisma.shift.updateMany({
            where: {
              shift_id: {
                in: shift_array,
              },
            },
            data: {
              status: 'Conflicted',
            },
          }),
        );
      } else if (
        data.leave_status &&
        (leave.leave_status === 'REJECTED' || leave.leave_status === 'PENDING')
      ) {
        //find all shits in the time period
        const all_shifts_of_user = await this.prisma.user_shift.findMany({
          where: {
            user_id: data.user_id,
            shift: {
              OR: [
                {
                  start_time: {
                    gte: new Date(leave.leave_start_date),
                    lte: new Date(leave.leave_end_date),
                  },
                },
                {
                  end_time: {
                    gte: new Date(leave.leave_start_date),
                    lte: new Date(leave.leave_end_date),
                  },
                },
              ],
            },
          },
          select: {
            shift: {
              select: {
                shift_id: true,
                start_time: true,
                end_time: true,
              },
            },
          },
        });

        for (const data of all_shifts_of_user) {
          //check if any user is on leave
          const user = await this.prisma.shift.count({
            where: {
              shift_id: data.shift.shift_id,
              user_shift: {
                some: {
                  user: {
                    leave: {
                      some: {
                        OR: [
                          {
                            leave_start_date: {
                              gte: new Date(data.shift.start_time),
                              lte: new Date(data.shift.end_time),
                            },
                          },
                          {
                            leave_end_date: {
                              gte: new Date(data.shift.start_time),
                              lte: new Date(data.shift.end_time),
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          });

          if (user > 0) {
            continue;
          }

          await this.prisma.handlePrismaError(
            this.prisma.shift.update({
              where: {
                shift_id: data.shift.shift_id,
              },
              data: {
                status: 'Resolved',
              },
            }),
          );

          await this.prisma.handlePrismaError(
            this.prisma.user_shift.updateMany({
              where: {
                shift_id: data.shift.shift_id,
              },
              data: {
                status: 'None',
              },
            }),
          );
        }
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteLeave): Promise<any> {
    try {
      const lve = await this.prisma.leave.findMany({
        where: {
          leave_id: {
            in: data.leaves,
          },
        },
      });

      for (let i = 0; i < lve.length; i++) {
        if (
          moment(lve[i].leave_start_date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') <
          moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
        ) {
          continue;
        }

        const diffDays =
          moment(lve[i].leave_end_date).diff(moment(lve[i].leave_start_date), 'days') +
          1;

        const usr = await this.prisma.user.findUnique({
          where: { user_id: lve[i].user_id },
        });

        await this.prisma.handlePrismaError(
          this.prisma.user.update({
            where: { user_id: lve[i].user_id },
            data: {
              sick_leaves:
                lve[i].leave_type === 'SICK'
                  ? usr.sick_leaves + diffDays
                  : usr.sick_leaves,
              earned_leaves:
                lve[i].leave_type === 'EARNED'
                  ? usr.earned_leaves + diffDays
                  : usr.earned_leaves,
              casual_leaves:
                lve[i].leave_type === 'CASUAL'
                  ? usr.casual_leaves + diffDays
                  : usr.casual_leaves,
              compunsatory_leaves:
                lve[i].leave_type === 'COMPUNSATORY'
                  ? usr.compunsatory_leaves + diffDays
                  : usr.compunsatory_leaves,
              unpaid_leaves:
                lve[i].leave_type === 'UNPAID'
                  ? usr.unpaid_leaves + diffDays
                  : usr.unpaid_leaves,
            },
          }),
        );
      }

      const leave = await this.prisma.handlePrismaError(
        this.prisma.leave.deleteMany({
          where: {
            leave_id: {
              in: data.leaves,
            },
          },
        }),
      );

      if (leave.count === 0) {
        throw new NotFoundException('Leave not found.');
      }

      return {
        message: 'Leaves deleted successfully',
        deletedLeaves: data.leaves,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
