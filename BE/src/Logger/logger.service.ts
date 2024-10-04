import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as moment from 'moment';
import { LOGGER_ENTITY_TYPE } from '@prisma/client';

export enum LogType {
  Create = 'Create',
  Read = 'Read',
  Update = 'Update',
  Delete = 'Delete',
}

@Injectable()
export class LoggerService {
  constructor(private prisma: PrismaService) {}

  async LOG(
    user: any,
    log_attrib_name: string,
    type: LogType,
    additionDetails: any = null,
    text_info?:string,
    attrib_id?:string[] | string,
    entity_name?:LOGGER_ENTITY_TYPE,
    actionName?:string,
    updatedData?:any,
    previosData?:any
  ): Promise<void> {
    try {

      // await this.prisma.logger.create({
      //   data: {
      //     user_id: user.userId,
      //     log_type: type,
      //     log_attrib_name: log_attrib_name,
      //     attrib_id: Array.isArray(attrib_id) ? attrib_id : [attrib_id],
      //     additional_details: additionDetails,
      //     Entity_name:entity_name,
      //     updateData:updatedData,
      //     previousData:previosData,
      //     actionName
      //   },
      // });


    } catch (error) {
      console.log(error);
    }
  }

  async getAll(
    search: string = '',
    startDate: string | Date,
    endDate: string | Date,
    logType: string,
    page: string,
    limit: string,
  ): Promise<any> {
    const query: any = {
      orderBy: {
        createdAt: 'desc',
      },
    };
    const where: any = {
      OR: [
        {
          log_attrib_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          log_attrib_name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    };
    query.where = where;

    if (logType) where.log_type = logType;

    if (startDate && endDate) {
      where.createdAt = {
        gte: moment(startDate).toDate(),
        lte: moment(endDate).toDate(),
      };
    } else if (startDate) {
      where.createdAt = {
        gte: moment(startDate).toDate(),
      };
    } else if (endDate) {
      where.createdAt = {
        lte: moment(endDate).toDate(),
      };
    }

    const totalLogs = await this.prisma.logger.count({ where });

    if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
    if (limit) query.take = parseInt(limit);

    const Logs: any = await this.prisma.logger.findMany(query);

    return {
      totalLogs,
      Logs,
    };
  }
}
