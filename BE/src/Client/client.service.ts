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
import {
  ChangeClient,
  CreateClient,
  DeleteClient,
  UpdateClient,
} from './dto/client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async getAllClientShifts(search: string) {
    try {
      const query: any = {
        include: {
          shift: {
            select: {
              shift_id: true,
              shift_name: true,
              start_time: true,
              end_time: true,
              status: true,
              shift_color: true,
              parent_repeat_shift: true,
            },
          },
        },
      };
      const where: any = {
        OR: [
          {
            client_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            client_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
      query.where = where;

      const totalClients = await this.prisma.client.count({ where });

      const all_clients: any = await this.prisma.client.findMany(query);

      let clientShifts: any = [];

      for (const client of all_clients) {
        for (const shift of client.shift) {
          if (shift.parent_repeat_shift && shift.parent_repeat_shift === true) continue;
          clientShifts.push({
            ...shift,
            client_name: client.client_name,
            client_id: client.client_id,
          });
        }
      }

      return {
        totalClients,
        clientShifts,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async findAll(search: string, page: string, limit: string) {
    try {
      const query: any = {};
      const where: any = {
        client_name: { contains: search, mode: 'insensitive' },
      };

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);
      query.where = where;

      const result = await this.prisma.client.findMany(query);
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async findAllWithInfo(search: string, page: string, limit: string) {
    try {
      const query: any = { include: { shift: true } };
      const where: any = {
        client_name: { contains: search, mode: 'insensitive' },
      };

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);
      query.where = where;

      const result = await this.prisma.client.findMany(query);
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.prisma.client.findUnique({
        where: { client_id: id },
        include: { shift: true },
      });
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateClient) {
    try {
      if (data.night_hour_start) {
        data.night_hour_start = moment(
          data.night_hour_start,
          'HH:mm:ssZ',
        ).toISOString();
      }
      if (data.day_hour_start) {
        data.day_hour_start = moment(data.day_hour_start, 'HH:mm:ssZ').toISOString();
      }

      const result =  await this.prisma.handlePrismaError(this.prisma.client.create({ data }));
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateClient) {
    try {
      if (data.night_hour_start) {
        data.night_hour_start = moment(
          data.night_hour_start,
          'HH:mm:ssZ',
        ).toISOString();
      }
      if (data.day_hour_start) {
        data.day_hour_start = moment(data.day_hour_start, 'HH:mm:ssZ').toISOString();
      }

      const result =  await this.prisma.handlePrismaError(this.prisma.client.update({
        where: { client_id: id },
        data,
      }));
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteClient) {
    try {
      const delClients =  await this.prisma.handlePrismaError(this.prisma.client.deleteMany({
        where: {
          client_id: { in: data.clients },
        },
      }));

      if (delClients.count === 0) {
        throw new NotFoundException('No client found');
      }
      return { message: 'Client deleted', deletedClients: data };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async changeClient(data: ChangeClient) {
    try {
      const shift = await this.prisma.shift.findUnique({
        where: { shift_id: data.swap_shift_id },
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      const toClient = await this.prisma.client.findUnique({
        where: { client_id: data.to_client },
      });

      if (!toClient) {
        throw new NotFoundException('Client not found');
      }

      const fromShift =  await this.prisma.handlePrismaError(this.prisma.shift.update({
        where: { shift_id: data.swap_shift_id },
        data: {
          client_id: data.to_client,
        },
        select: {
          shift_id: true,
          shift_name: true,
          start_time: true,
          end_time: true,
          status: true,
          shift_color: true,
        },
      }));

      const clientShift = {
        ...fromShift,
        client_name: toClient.client_name,
        client_id: toClient.client_id,
      };

      return clientShift;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
