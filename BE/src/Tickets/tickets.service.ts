import { PrismaService } from 'src/prisma.service';
import { LEAVE_STATUS, TICKET_TYPE, Tickets } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTicket, DeleteTickets, UpdateTickets } from './dto/tickets.dto';
import { NotificationGateway } from 'src/Notification/gateway/notification.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private notiGate: NotificationGateway,
    private prisma: PrismaService,
  ) {}

  async getAllUserTickets(
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
            ticket_title: {
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
            { ticket_date: { gte: new Date(startDate) } },
            { ticket_date: { lte: new Date(endDate) } },
          ],
        };
      } else if (startDate) {
        where.ticket_date = {
          gte: new Date(startDate),
        };
      } else if (endDate) {
        where.ticket_date = {
          lte: new Date(endDate),
        };
      }

      if (type) where.ticket_type = type as TICKET_TYPE;

      if (status) where.ticket_status = status as LEAVE_STATUS;
      query.where = where;

      const totalTickets = await this.prisma.tickets.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const tickets = await this.prisma.tickets.findMany(query);

      return { tickets, totalTickets };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getTickets(id: string, userId: string): Promise<Tickets> {
    try {
      const tickets = await this.prisma.tickets.findUnique({
        where: { ticket_id: id },
      });

      if (userId && tickets.user_id !== userId) {
        throw new ForbiddenException('You are not allowed to access');
      }

      return tickets;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateTicket): Promise<Tickets> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: data?.user_id },
      });

      if (!user) {
        throw new ConflictException('User Not Found');
      }

      const ticket = await this.prisma.handlePrismaError(
        this.prisma.tickets.create({
          data: {
            ...data,
          },
        }),
      );

      if (ticket.ticket_status === 'PENDING') {
        await this.notiGate.handlesSendNotification({
          title: `Raise a Ticket`,
          description: `${data?.ticket_type} Ticket from ` + user?.user_name,
          notification_type: 'Tickets',
          notification_status: 'Pending',
          roles: ['ADMIN', 'HR'],
          userId: null,
        });
      }

      return ticket;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateTickets): Promise<Tickets> {
    try {
      let ticket = await this.prisma.tickets.findUnique({
        where: { ticket_id: id },
      });

      if (!ticket) {
        throw new ConflictException('Ticket not found');
      }

      if (
        ticket.ticket_status === 'APPROVED' ||
        ticket.ticket_status === 'REJECTED'
      ) {
        throw new BadRequestException(
          `The Ticket has been already ${ticket?.ticket_status?.toLowerCase()}!!!`,
        );
      }

      ticket = await this.prisma.handlePrismaError(
        this.prisma.tickets.update({
          where: { ticket_id: id },
          data: data,
        }),
      );

      return ticket;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteTickets): Promise<any> {
    try {
      const tickets = await this.prisma.handlePrismaError(
        this.prisma.tickets.deleteMany({
          where: {
            ticket_id: {
              in: data?.tickets,
            },
          },
        }),
      );

      if (tickets.count === 0) {
        throw new ConflictException('Tickets could not be deleted');
      }

      return {
        message: 'Tickets deleted successfully',
        deletedRemarks: data.tickets,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
