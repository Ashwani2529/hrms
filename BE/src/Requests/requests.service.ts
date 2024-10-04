import { PrismaService } from 'src/prisma.service';
import { LEAVE_STATUS, REQUEST_TYPE, Requests } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRequest, DeleteRequests, UpdateRequests } from './dto/requests.dto';
import { NotificationGateway } from 'src/Notification/gateway/notification.gateway';

@Injectable()
export class RequestService {
  constructor(
    private notiGate: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async getAllUserRequests(
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
        orderBy: [{ createdAt: 'desc' }],
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
            request_title: {
              contains: search,
              mode: 'insensitive',
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
            { request_date: { gte: new Date(startDate) } },
            { request_date: { lte: new Date(endDate) } },
          ],
        };
      } else if (startDate) {
        where.request_date = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
        where.request_date = {
          lte: new Date(endDate),
        };
      }

      if (type) where.request_type = type as REQUEST_TYPE;

      if (status) where.request_status = status as LEAVE_STATUS;
      query.where = where;

      const totalRequests = await this.prisma.requests.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const requests = await this.prisma.requests.findMany(query);

      return { requests, totalRequests };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getRequests(id: string, userId: string): Promise<Requests> {
    try {
      const requests = await this.prisma.requests.findUnique({
        where: { request_id: id },
      });

      if (userId && requests.user_id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      return requests;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateRequest): Promise<Requests> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: data?.user_id },
      });

      if (!user) {
        throw new ConflictException('User Not Found');
      }

      const request = await this.prisma.handlePrismaError(
        this.prisma.requests.create({
          data: {
            ...data,
          },
        }),
      );

      if (request.request_status === 'PENDING') {
        await this.notiGate.handlesSendNotification({
          title: `New Request Created`,
          description: `${data?.request_type} Request from ` + user?.user_name,
          notification_type: 'Requests',
          notification_status: 'Pending',
          roles: ['ADMIN', 'HR'],
          userId: null,
        });
      }

      return request;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateRequests): Promise<Requests> {
    try {
      let request = await this.prisma.requests.findUnique({
        where: { request_id: id },
      });

      if (!request) {
        throw new ConflictException('Request not found');
      }

      if (
        request.request_status === 'APPROVED' ||
        request.request_status === 'REJECTED'
      ) {
        throw new BadRequestException(
          `The Request has been already ${request?.request_status?.toLowerCase()}!!!`,
        );
      }

      request = await this.prisma.handlePrismaError(
        this.prisma.requests.update({
          where: { request_id: id },
          data: data,
        }),
      );

      return request;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteRequests): Promise<any> {
    try {
      const requests = await this.prisma.handlePrismaError(
        this.prisma.requests.deleteMany({
          where: {
            request_id: {
              in: data?.requests,
            },
          },
        }),
      );

      if (requests.count === 0) {
        throw new ConflictException('Requests could not be deleted');
      }

      return {
        message: 'Requests deleted successfully',
        deletedRemarks: data.requests,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
