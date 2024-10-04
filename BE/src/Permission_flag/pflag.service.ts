import { PrismaService } from 'src/prisma.service';
import { Permission_flag } from '@prisma/client';
import {
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePflag, PflagDelete, UpdatePflag } from './dto/pflag.dto';

@Injectable()
export class PflagService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Permission_flag[]> {
    try {
      return this.prisma.permission_flag.findMany({});
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllRoles(): Promise<any> {
    try {
      const pflags = await this.prisma.permission_flag.findMany({
        include: {
          role_permissions: true,
        },
      });
      return pflags;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string): Promise<Permission_flag> {
    try {
      const pflag = await this.prisma.permission_flag.findUnique({
        where: { permission_flag_id: id },
        include: {
          role_permissions: true,
        },
      });
      if (!pflag) {
        throw new NotFoundException('This pflag does not exist');
      }
      return pflag;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getPermissionedRoles(id: string): Promise<any> {
    try {
      const pflag = await this.prisma.permission_flag.findUnique({
        where: { permission_flag_id: id },
        include: {
          role_permissions: true,
        },
      });
      if (!pflag) {
        throw new NotFoundException('This pflag does not exist');
      }
      return pflag;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreatePflag): Promise<Permission_flag> {
    try {
      return  await this.prisma.handlePrismaError(this.prisma.permission_flag.create({
        data: {
          permission_flag_name: data.name,
          permission_flag_description: data.description,
        },
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdatePflag): Promise<Permission_flag> {
    try {
      const pflag = await this.prisma.permission_flag.findUnique({
        where: { permission_flag_id: id },
      });
      if (!pflag) {
        throw new NotFoundException('This pflag does not exist');
      }
      return  await this.prisma.handlePrismaError(this.prisma.permission_flag.update({
        where: { permission_flag_id: id },
        data: {
          permission_flag_name: data.name,
          permission_flag_description: data.description,
        },
      }));
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(body: PflagDelete): Promise<any> {
    try {
      const pflagDelete =  await this.prisma.handlePrismaError(this.prisma.permission_flag.deleteMany({
        where: {
          permission_flag_id: {
            in: body.pflags,
          },
        },
      }));

      if (pflagDelete.count === 0) {
        throw new NotFoundException('No pflag found');
      }

      return {
        message: 'Pflags deleted successfully',
        deletedPflags: body.pflags,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
