import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { CreateUser, DeleteUser, GenerateUserSampleExcel, UpdateUser, VerifyUser } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogType, LoggerService } from 'src/Logger/logger.service';
import { Roles } from 'src/Auth/guards/role.guard';
import { unlinkSync } from 'fs';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logs: LoggerService
  ) {}

  @Roles(["ADMIN","HR"])
  @Get('/shifts/:userId')
  async getUserShifts(@Param('userId') id: string, @Res() res: Response) {
    const shifts = await this.userService.getShiftsByUser(id);
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR"])
  @Get('/withinfo')
  async getAllUsersWithInfo(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('emp_type') emp_type: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const users = await this.userService.getAllUsersWithInfo(
      search,
      page,
      limit,
      status,
      emp_type,
    );
    return res.status(200).json(users);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get('/getAllUserShifts')
  async getAllUserShifts(
    @Req() req: Request | any,
    @Res() res: Response,
    @Query('search') search: string = '',
    @Query('client') client: string,
  ) {
    const shifts = await this.userService.getAllUserShifts(search,req?.userId ?? null,client || null);     // for emp only
    return res.status(200).json(shifts);
  }

  @Roles(["ADMIN","HR"])
  @Get()
  async getAllUsers(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('emp_type') emp_type: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const users = await this.userService.getAllUsers(
      search,
      page,
      limit,
      status,
      emp_type,
    );
    return res.status(200).json(users);
  }

  @Roles(["ADMIN","HR","EMP"])
  @Get(':userId')
  async getUserById(@Param('userId') id: string, @Req() req: Request | any, @Res() res: Response) {
    const user = await this.userService.getUserById(id,req?.userId ?? null);     // for emp only
    return res.status(200).json(user);
  }

  @Roles(["ADMIN","HR"])
  @Post('create-multiple')
  @UseInterceptors(FileInterceptor('file'))
  async createMultipleUser(
    @UploadedFile() file: any,
    @Body() data: GenerateUserSampleExcel,
    @Res() res: Response,
    @Req() req: Request | any,
  ) {
    const companyId: string = req.user.company_id;
    const user = await this.userService.createMultipleUser(file, companyId , data?.templateId ?? null);
    res.status(201).json(user);
    // await this.logs.LOG(req.user, 'Created Multiple Users', LogType.Create,null,
    // `${req.user?.name} created mutiple users with file upload`
    // );
    return;
  }

  @Roles(['ADMIN', 'HR'])
  @Post('generateSampleExcel')
  async generateUserSampleExcel(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: GenerateUserSampleExcel,
  ) {
    await this.userService.generateSampleExcel(body);

    // Send the file to the frontend
    res.download('./data.xlsx', 'bulk-user-sample.xlsx', err => {
      if (err) {
        console.error('Error sending file:', err);
      } else {
        // Delete the temporary file after download completes
        unlinkSync('./data.xlsx');
      }
    });

    // await this.logs.LOG(
    //   req.user,
    //   'Bulk User Sample Generated',
    //   LogType.Create,
    //   null,
    //   `${req.user?.name} generated salary sample for bulk update`,
    // );

    return;
  }

  @Roles(["ADMIN","HR"])
  @Post()
  async createUser(
    @Body() data: CreateUser,
    @Res() res: Response,
    @Req() req: Request | any,
  ) {
    const user = await this.userService.createUser(data);
    res.status(201).json(user);
    await this.logs.LOG(req.user, 'Created User', LogType.Create, null , 
    `${req.user?.name} created user with id ${user?.user_id} email ${data?.user_email}`
    );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('delete')
  async deleteUser(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: DeleteUser,
  ) {
    const user = await this.userService.deleteUser(body);
    res.status(201).json(user);
    await this.logs.LOG(req.user, 'Deleted User', LogType.Delete, body,
    `${req.user?.name} deleted users with ids ${body.users}`
    );
    return;
  }

  @Roles(["ADMIN","HR","EMP"])
  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() body: UpdateUser,
    @Req() req: Request | any,
    @Res() res: Response,
  ) {
    const user = await this.userService.updateUser(userId, body, req?.userId ?? null);
    res.status(200).json(user);
    // await this.logs.LOG(req.user, 'Updated User', LogType.Update, { userId, body },
    // `${req.user?.name} updated user with id ${userId}`
    // );
    return;
  }

  @Roles(["ADMIN","HR"])
  @Post('verify')
  async verifyUser(
    @Req() req: Request | any,
    @Res() res: Response,
    @Body() body: VerifyUser,
  ) {
    const user = await this.userService.verifyUser(body);
    res.status(201).json(user);
    await this.logs.LOG(req.user, 'Verified User', LogType.Update, body,
    `${req.user?.name} verified user with id ${body?.user_id}`
    );
    return;
  }
}
