import { PrismaService } from 'src/prisma.service';
import { Role } from '@prisma/client';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AddPermission, CreateRoll, DeleteRoll, UpdateRoll } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllWithInfo(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        include: {
          users: true,
          role_permission: {
            include: {
              permission_flag: true,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getOne(id: string): Promise<Role> {
    try {
      const role = await this.prisma.role.findUnique({
        where: {
          role_id: id,
        },
        include: {
          users: true,
          role_permission: {
            include: {
              permission_flag: true,
            },
          },
        },
      });
      return role;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateRoll): Promise<Role> {
    try {
      const role =  await this.prisma.handlePrismaError(this.prisma.role.create({
        data: {
          ...data,
        },
      }));
      return role;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateRoll): Promise<Role> {
    try {
      const role_exist = await this.prisma.role.findUnique({
        where: { role_id: id },
      });
      if (!role_exist) {
        throw new NotFoundException('Role does not exist!');
      }
      const role =  await this.prisma.handlePrismaError(this.prisma.role.update({
        where: { role_id: id },
        data: {
          ...data,
        },
      }));
      return role;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteRoll): Promise<any> {
    try {
      const roles =  await this.prisma.handlePrismaError(this.prisma.role.deleteMany({
        where: {
          role_id: {
            in: data.roles,
          },
        },
      }));

      if (roles.count === 0) {
        throw new NotFoundException('Roles does not exist!');
      }

      return {
        message: 'Roles deleted successfully',
        deletedRoles: data.roles,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async addPermissionToRole(roleId: string, data: AddPermission): Promise<any> {
    try {
      const role_exist = await this.prisma.role.findUnique({
        where: { role_id: roleId },
      });
      if (!role_exist) {
        throw new NotFoundException('Role does not exist!');
      }

      await this.prisma.handlePrismaError(this.prisma.role_permission.deleteMany({
        where: {
          role_id: roleId,
        },
      }));
      let result = [];
      for (const permissionId of data.permissions) {
        const permission_exist = await this.prisma.permission_flag.findUnique({
          where: { permission_flag_id: permissionId },
        });
        if (!permission_exist) {
          throw new NotFoundException('Permission flag does not exist!');
        }
        const role_permission =  await this.prisma.handlePrismaError(this.prisma.role_permission.create({
          data: {
            role_id: roleId,
            permission_flag_id: permissionId,
          },
        }));
        result.push(role_permission);
      }
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<any> {
    try {
      const role_exist = await this.prisma.role.findUnique({
        where: { role_id: roleId },
      });
      if (!role_exist) {
        throw new NotFoundException('Role does not exist!');
      }
      const permission_exist = await this.prisma.permission_flag.findUnique({
        where: { permission_flag_id: permissionId },
      });
      if (!permission_exist) {
        throw new NotFoundException('Permission flag does not exist!');
      }
      const remove_permission =  await this.prisma.handlePrismaError(this.prisma.role_permission.deleteMany({
        where: {
          role_id: roleId,
          permission_flag_id: permissionId,
        },
      }));
      return remove_permission;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
