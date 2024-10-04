import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { Request, Response } from 'express';
import { AddPermission, CreateRoll, DeleteRoll, UpdateRoll } from './dto/role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';

@Controller('role')
@ApiBearerAuth()
@ApiTags('Role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly logs: LoggerService,
  ) {}

  @Roles(["ADMIN"])
  @Post('/addPermission/:roleId')
  async addPermission(
    @Param('roleId') roleId: string,
    @Body() body: AddPermission,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const role = await this.roleService.addPermissionToRole(roleId, body);
    res.status(201).json(role);
    await this.logs.LOG(req.user, 'Added Permission', LogType.Update, {
      roleId: roleId,
      body,
    },
    `${req.user?.name} added Permissions ${body.permissions} to roleid ${roleId}`);
    return;
  }

  @Roles(["ADMIN"])
  @Post('/removePermission/:roleId/:permissionId')
  async removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const role = await this.roleService.removePermissionFromRole(roleId, permissionId);
    res.status(201).json(role);
    await this.logs.LOG(req.user, 'Added Permission', LogType.Update, {
      roleId: roleId,
      permissionId: permissionId,
    },
    `${req.user?.name} removed Permission with id ${permissionId} from role ${roleId}`);
    return;
  }

  @Roles(["ADMIN"])
  @Get('/withinfo')
  async getAllWithInfo(@Req() req: Request, @Res() res: Response) {
    const roles = await this.roleService.getAllWithInfo();
    return res.status(200).json(roles);
  }

  @Roles(["ADMIN"])
  @Get()
  async getAll(@Req() req: Request, @Res() res: Response) {
    const roles = await this.roleService.getAll();
    return res.status(200).json(roles);
  }

  @Roles(["ADMIN"])
  @Get(':roleId')
  async getOne(@Param('roleId') id: string, @Res() res: Response) {
    const role = await this.roleService.getOne(id);
    return res.status(200).json(role);
  }

  @Roles(["ADMIN"])
  @Post('/delete')
  async deleteMany(
    @Body() body: DeleteRoll,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const roles = await this.roleService.delete(body);
    res.status(201).json(roles);
    await this.logs.LOG(req.user, 'Deleted Roles', LogType.Delete, body,
    `${req.user?.name} deleted roles with ids ${body.roles}`
    );
    return;
  }

  @Roles(["ADMIN"])
  @Post()
  async create(@Body() body: CreateRoll, @Req() req: Request | any, @Res() res: Response) {
    const role = await this.roleService.create(body);
    res.status(201).json(role);
    await this.logs.LOG(req.user, 'Created Role', LogType.Create, body,
    `${req.user?.name} created role ${body.role_name}`
    );
    return;
  }

  @Roles(["ADMIN"])
  @Put(':roleId')
  async update(
    @Param('roleId') id: string,
    @Body() body: UpdateRoll,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const role = await this.roleService.update(id, body);
    res.status(200).json(role);
    await this.logs.LOG(req.user, 'Updated Role', LogType.Update, { roleId: id, body },
    `${req.user?.name} updated role with id ${id}`
    );
    return;
  }
}
