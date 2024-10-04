import { PrismaService } from 'src/prisma.service';
import { User, User_shift } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CreateUser,
  DeleteUser,
  GenerateUserSampleExcel,
  UpdateUser,
  VerifyUser,
} from './dto/user.dto';
import { AuthService } from 'src/Auth/auth.service';
import { emailConfig } from 'src/Config/emailConfig';
import * as moment from 'moment';
import * as ExcelJS from 'exceljs';
import { getPresignedUrl } from 'src/Config/getPresignedUrl';
import { DocService } from 'src/User_Doc/doc.service';

@Injectable()
export class UserService {
  constructor(
    private docService: DocService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  exclude(user: Partial<User>, keys: string[]) {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key)),
    );
  }

  async getAllUserShifts(
    search: string,
    userId: string,
    client?: string,
  ): Promise<any> {
    try {
      const query: any = {
        include: {
          user_shift: {
            include: {
              shift: {
                select: {
                  shift_name: true,
                  start_time: true,
                  end_time: true,
                  status: true,
                  shift_color: true,
                  parent_repeat_shift: true,
                  client: {
                    select: {
                      client_name: true,
                      client_id: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          user_name: 'asc',
        },
      };
      const where: any = {
        OR: [
          {
            user_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            user_email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };

      // if user id is given -----------
      if (userId) {
        where.user_id = userId;
      }

      query.where = where;

      const totalShifts = await this.prisma.user.count({ where });

      const resp: any = await this.prisma.user.findMany(query);

      let userShifts = [];
      for (const user of resp) {
        for (const u_shift of user.user_shift) {
          if (
            (u_shift.shift.parent_repeat_shift &&
              u_shift.shift.parent_repeat_shift === true) ||
            (client && u_shift?.shift?.client?.client_id != client)
          ) {
            continue;
          }

          userShifts.push({
            shift_name: u_shift.shift?.shift_name,
            start_time: u_shift.shift?.start_time,
            end_time: u_shift.shift?.end_time,
            status: u_shift.shift?.status,
            shift_color: u_shift.shift?.shift_color,
            client_id: u_shift.shift.client?.client_id,
            client_name: u_shift.shift.client?.client_name,
            user_id: user.user_id,
            user_name: user.user_name,
            shift_id: u_shift.shift_id,
            user_shift_id: u_shift.user_shift_id,
            user_shift_status: u_shift.status,
          });
        }
      }

      return {
        totalShifts,
        userShifts,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllUsers(
    search: string,
    page: string,
    limit: string,
    status: string,
    emp_type: string,
  ): Promise<any> {
    try {
      const query: any = {
        orderBy: {
          user_name: 'asc',
        },
        where: {
          OR: [
            {
              user_name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user_email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      };

      if (status) query.where.status = status;
      if (emp_type) query.where.employement_type = emp_type;

      const totalUsers = await this.prisma.user.count({ where: query.where });

      if (page && limit) {
        query.skip = (parseInt(page) - 1) * parseInt(limit);
        query.take = parseInt(limit);
      }

      const users: any = await this.prisma.user.findMany(query);

      // Exclude sensitive information from users
      users.forEach(user => this.exclude(user, ['user_password']));

      const currentDate = new Date();
      const [startOfFinancialYear, endOfFinancialYear] =
        currentDate.getMonth() + 1 >= 4
          ? [
              new Date(currentDate.getFullYear(), 3, 1),
              new Date(currentDate.getFullYear() + 1, 2, 31, 23, 59, 59),
            ]
          : [
              new Date(currentDate.getFullYear() - 1, 3, 1),
              new Date(currentDate.getFullYear(), 2, 31, 23, 59, 59),
            ];

      // Gather leave information for all users in parallel
      const leaveData = await Promise.all(
        users.map(async user => {
          let [totalUsed, totalCredited, granted, rejected, accepted, lapsed] =
            await Promise.all([
              this.prisma.leave.aggregate({
                _sum: { debit_amt: true },
                where: {
                  user_id: user.user_id,
                  trans_status: 'DEBIT',
                  leave_status: { notIn: ['LAPSED', 'REJECTED'] },
                  createdAt: { gte: startOfFinancialYear, lte: endOfFinancialYear },
                },
              }),
              this.prisma.leave.aggregate({
                _sum: { credit_amt: true },
                where: {
                  user_id: user.user_id,
                  leave_status: { not: 'REFUNDED' },
                  trans_status: 'CREDIT',
                  createdAt: { gte: startOfFinancialYear, lte: endOfFinancialYear },
                },
              }),
              this.prisma.leave.aggregate({
                _sum: { credit_amt: true },
                where: { user_id: user.user_id, leave_status: 'GRANTED' },
              }),
              this.prisma.leave.aggregate({
                _sum: { debit_amt: true },
                where: { user_id: user.user_id, leave_status: 'REJECTED' },
              }),
              this.prisma.leave.aggregate({
                _sum: { debit_amt: true },
                where: { user_id: user.user_id, leave_status: 'APPROVED' },
              }),
              this.prisma.leave.count({
                where: { user_id: user.user_id, leave_status: 'LAPSED' },
              }),
            ]);

          let current = totalCredited?._sum?.credit_amt - totalUsed?._sum?.debit_amt;

          return {
            ...user,
            granted:granted?._sum?.credit_amt||0,
            accepted:accepted?._sum?.debit_amt||0,
            applied: (rejected?._sum?.debit_amt||0) + (accepted?._sum?.debit_amt||0), 
            lapsed,
            current,
          };
        }),
      );
      return {
        users,
        totalUsers,
        allUsers: leaveData,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occurred');
    }
  }

  async getAllUsersWithInfo(
    search: string,
    page: string,
    limit: string,
    status: string,
    emp_type: string,
  ): Promise<any> {
    try {
      const query: any = {
        include: {
          role: true,
          company: true,
        },
        orderBy: {
          user_name: 'asc',
        },
      };
      const where: any = {
        OR: [
          {
            user_name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            user_email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
      query.where = where;

      if (status) where.status = status;
      if (emp_type) where.employement_type = emp_type;

      const totalUsers = await this.prisma.user.count({ where });

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      const users: any = await this.prisma.user.findMany(query);

      for (let i = 0; i < users.length; i++) {
        users[i] = this.exclude(users[i], ['user_password']);
      }

      return {
        totalUsers,
        users,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getUserById(id: string, userId: string): Promise<any> {
    try {
      if (userId && id !== userId) {
        throw new ForbiddenException('You are not allowed');
      }

      const user = await this.prisma.user.findUnique({
        where: { user_id: id },
        include: {
          role: true,
          company: true,
          payroll: {
            include: {
              salary: true,
              bonus: true,
            },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User does not exist!');
      }
      // for (const keys in user.user_documents as any) {
      //   if (user.user_documents[keys] && user.user_documents[keys].length > 0) {
      //     user.user_documents[keys] = await getPresignedUrl(user.user_documents[keys]);
      //   }
      // }

      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createUser(data: CreateUser): Promise<User> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { user_email: data.user_email },
      });

      if (user) {
        throw new ConflictException('User already exists!');
      }

      if (data.date_of_birth) {
        data.date_of_birth = moment(data.date_of_birth, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );
      }

      if (data.date_of_joining) {
        data.date_of_joining = moment(data.date_of_joining, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );
      }

      let leaves_reset_values = {};

      if (
        data?.casual_leaves ||
        data?.sick_leaves ||
        data?.unpaid_leaves ||
        data?.granted_leaves
      ) {
        leaves_reset_values = {
          casual_leaves: data?.casual_leaves,
          sick_leaves: data?.sick_leaves,
          unpaid_leaves: data?.unpaid_leaves,
          granted_leaves: data?.granted_leaves,
        };
      }

      const sendTemplateLetter = data?.sendSignedDoc ?? false;
      delete data?.sendSignedDoc;

      user = await this.prisma.handlePrismaError(
        this.prisma.user.create({
          data: {
            ...data,
            user_name:
              data?.user_name ||
              data?.firstname +
                (data?.middlename ? ' ' + data?.middlename : '') +
                (data?.lastname ? ' ' + data?.lastname : ''),
            leaves_reset_values,
          },
        }),
      );

      await this.prisma.handlePrismaError(
        this.prisma.payroll.create({
          data: {
            user_id: user.user_id,
          },
        }),
      );

      if (data?.casual_leaves || data?.sick_leaves) {
        const transactions = Object.keys(leaves_reset_values)
          ?.map(e => {
            if (data[e]) {
              return this.prisma.leave.create({
                data: {
                  leave_name: 'Credit via employee dashboard',
                  trans_status: 'CREDIT',
                  leave_type: e === 'casual_leaves' ? 'CASUAL' : 'SICK',
                  leave_status: 'GRANTED',
                  user_id: user?.user_id,
                  credit_amt: data[e],
                },
              });
            }
            return null;
          })
          .filter(transaction => transaction !== null); // Filter out null values

        if (transactions.length > 0) {
          await this.prisma.handlePrismaError(this.prisma.$transaction(transactions));
        }
      }

      // to send reset ea --------
      if (!sendTemplateLetter) {
        // send reset email ----
        await this.authService.send_onboarding_email(user.user_email);
      }

      return user;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async updateUser(id: string, data: UpdateUser, userId?: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { user_id: userId ?? id },
      });

      if (!user) {
        throw new NotFoundException('User does not exist!');
      }

      if (data.date_of_birth) {
        data.date_of_birth = moment(data.date_of_birth, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );
      }

      if (data.date_of_joining) {
        data.date_of_joining = moment(data.date_of_joining, 'YYYY-MM-DD').format(
          'YYYY-MM-DDTHH:mm:ss.SSS[Z]',
        );
      }

      if (data.date_of_birth > data.date_of_joining) {
        throw new ConflictException(
          'Date of birth cannot be greater than date of joining',
        );
      }

      let leaves_reset_values = user?.leaves_reset_values;

      if (!userId) {
        if (data?.casual_leaves || data?.sick_leaves || data?.unpaid_leaves) {
          leaves_reset_values = {
            casual_leaves: data?.casual_leaves ?? user?.casual_leaves,
            sick_leaves: data?.sick_leaves ?? user?.sick_leaves,
            unpaid_leaves: data?.unpaid_leaves ?? user?.unpaid_leaves,
          };

          const transactions = Object.keys(leaves_reset_values)
            ?.map(e => {
              if (data[e]) {
                return this.prisma.leave.create({
                  data: {
                    leave_name: 'Credit via employee dashboard',
                    trans_status: 'CREDIT',
                    leave_type: e === 'casual_leaves' ? 'CASUAL' : 'SICK',
                    leave_status: 'APPROVED',
                    user_id: user?.user_id,
                    credit_amt: data[e],
                  },
                });
              }
              return null;
            })
            .filter(transaction => transaction !== null); // Filter out null values

          if (transactions.length > 0) {
            await this.prisma.handlePrismaError(this.prisma.$transaction(transactions));
          }
        }
      }

      delete data?.sendSignedDoc;

      return await this.prisma.handlePrismaError(
        this.prisma.user.update({
          where: { user_id: id },
          data: {
            ...data,
            user_name:
              data?.user_name ||
              `${data?.firstname ?? ''}${data?.middlename ? ' ' + data?.middlename : ''}${data?.lastname ? ' ' + data?.lastname : ''}`,
            leaves_reset_values,
          },
        }),
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async deleteUser(data: DeleteUser): Promise<any> {
    try {
      const deleteUser = await this.prisma.handlePrismaError(
        this.prisma.user.deleteMany({
          where: {
            user_id: {
              in: data.users,
            },
          },
        }),
      );

      if (deleteUser.count === 0) {
        throw new NotFoundException('User does not exist!');
      }

      return {
        message: 'Users deleted successfully',
        deletedUsers: data.users,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getShiftsByUser(user_id: string): Promise<User_shift[]> {
    try {
      const shifts = this.prisma.user_shift.findMany({
        where: { user_id },
        include: {
          shift: true,
          user: true,
        },
      });

      return shifts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getShiftsByUserAndDate(user_id: string, date: Date): Promise<User_shift[]> {
    try {
      const shifts = await this.prisma.user_shift.findMany({
        where: {
          user_id,
          shift: {
            start_time: {
              lte: date,
            },
            end_time: {
              gte: date,
            },
          },
        },
        include: {
          shift: true,
          user: true,
        },
      });
      return shifts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getShiftsByUserAndRange(
    user_id: string,
    start_date: Date,
    end_date: Date,
  ): Promise<User_shift[]> {
    try {
      const shifts = await this.prisma.user_shift.findMany({
        where: {
          user_id,
          shift: {
            start_time: {
              lte: end_date,
            },
            end_time: {
              gte: start_date,
            },
          },
        },
        include: {
          shift: true,
          user: true,
        },
      });
      return shifts;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async verifyUser(data: VerifyUser): Promise<any> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { user_id: data.user_id },
      });
      if (!user) {
        throw new NotFoundException('User does not exist!');
      }

      const transporter: any = await emailConfig();

      if (data.status === 'APPROVE') {
        user = await this.prisma.handlePrismaError(
          this.prisma.user.update({
            where: { user_id: data.user_id },
            data: {
              isApproved: true,
              status: 'Active',
            },
          }),
        );

        const message = {
          from: 'Heliverse pm@heliverse.com',
          to: user.user_email,
          subject: 'Click this Link for Onboarding process:',
          html: `<h1>Congratulations, your request has been approved</h1>`,
        };

        await transporter.sendMail(message);
      } else if (data.status === 'REJECT') {
        const message = {
          from: 'Heliverse pm@heliverse.com',
          to: user.user_email,
          subject: 'Click this Link for Onboarding process:',
          html: `<h1>Sorry, your request has been rejected</h1>
               <h3>Reason</h3> <br/>
                ${data.reject_reason},
               <h3>Change Form - ${process.env.BASE_FRONTEND_URL + '/user/details'}</h3>`,
        };

        await transporter.sendMail(message);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || `Failed to create users ${error}`,
      );
    }
  }

  async createMultipleUser(
    file: Buffer,
    companyId: string,
    templateId?: string,
  ): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('Excel file is required');
      }

      const buffer = Buffer.from(file.buffer as ArrayBuffer);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);
      const usersData = [];
      const templateUserData = [];
      const errors = [];

      //getting columns header and removing non string values if any
      const columnHeaders: string[] = (
        worksheet.getRow(1).values as Array<string | null>
      )
        .filter(value => typeof value === 'string' && value !== null)
        .map(value => value as string);

      let template = null;

      if (templateId) {
        template = await this.prisma.companyTemplate.findUnique({
          where: { template_id: templateId },
        });
      }

      worksheet?.eachRow(async (row, rowNumber) => {
        try {
          const rowData: Record<string, any> = {};
          if (rowNumber === 1) {
            // Skiping first row (header information)
            return;
          }

          // Iterating over columns headers and getting values of all headers
          columnHeaders?.forEach((header: any, columnIndex: number) => {
            const cellValue: any = row.getCell(columnIndex + 1).value;

            if (cellValue && typeof cellValue === 'object') {
              if ('text' in cellValue) {
                if (typeof cellValue?.text === 'object') {
                  if ('richText' in cellValue?.text) {
                    rowData[header] = cellValue?.text?.richText
                      ?.map((fragment: any) => fragment?.text)
                      .join('')
                      .trim();
                  }
                } else {
                  rowData[header] = cellValue.text.toString().trim();
                }
              } else {
                rowData[header] = cellValue.toString().trim();
              }
            } else {
              rowData[header] = cellValue;
            }
          });

          // Validating mandatory fields
          const mandatoryFields = [
            'firstname',
            'user_email',
            'date_of_joining',
            'role',
          ];
          const templateFields = template?.custom_variables?.map(e => {
            return `template_${e}`;
          });

          const mandatoryRowData = {};
          const templateRowData = {};

          if (templateFields) {
            for (const field of templateFields) {
              if (!rowData[field]) {
                throw new BadRequestException(
                  `Template field "${field}" is missing in row ${rowNumber}`,
                );
              } else {
                templateRowData[field.replace('template_', '')] = rowData[field];
              }
            }

            templateUserData.push(templateRowData);
          }

          for (const field of mandatoryFields) {
            if (!rowData[field]) {
              throw new BadRequestException(
                `Mandatory field "${field}" is missing in row ${rowNumber}`,
              );
            } else {
              mandatoryRowData[field] = rowData[field];
            }
          }

          if (mandatoryRowData['date_of_joining']) {
            const formats = ['DD/MM/YYYY', 'DD-MM-YYYY'];

            // Attempt to parse the input date using moment
            let parsedDate = moment(rowData['date_of_joining'], formats, true);

            // Check if the parsed date is valid
            if (!parsedDate.isValid()) {
              parsedDate = moment(rowData['date_of_joining']);

              if (!parsedDate.isValid())
                throw new BadRequestException(
                  `Invalid date format: ${rowData['date_of_joining']}`,
                );
            }

            mandatoryRowData['date_of_joining'] = parsedDate?.toDate();
          }

          mandatoryRowData['company_id'] = companyId;

          usersData.push({
            lastname: rowData?.lastname,
            middlename: rowData?.middlename,
            ...mandatoryRowData,
          });
        } catch (error) {
          console.log(error);
          errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      });

      if (errors.length > 0) {
        throw new InternalServerErrorException(
          `Failed to process excel file try again`,
        );
      }

      const roles = await this.prisma.role.findMany({
        select: {
          role_name: true,
          role_id: true,
        },
      });

      const rolesMap = new Map();

      for (let index = 0; index < roles.length; index++) {
        const element = roles[index];
        rolesMap[element.role_name] = element?.role_id;
      }

      for (let index = 0; index < usersData.length; index++) {
        const element = usersData[index];
        element['role_id'] = rolesMap[element.role];

        if (!element['role_id']) {
          throw new BadRequestException(`Invalid role: ${element?.role}`);
        }

        delete element.role;
      }

      // check for already existing users;
      const check = await this.prisma.user.findMany({
        where: {
          user_email: {
            in: usersData?.map(e => e?.user_email),
          },
        },
      });

      if (check?.length > 0) {
        throw new BadRequestException('Some Users already exist');
      }

      // Create users using Prisma createMany method
      const result = await this.prisma.handlePrismaError(
        this.prisma.$transaction(
          usersData?.map(user =>
            this.prisma.user.create({
              data: {
                payroll: {
                  create: {},
                },
                user_name:
                  user?.firstname +
                  (user?.middlename ? ' ' + user?.middlename : '') +
                  (user?.lastname ? ' ' + user?.lastname : ''),
                ...user,
              },
            }),
          ),
        ),
      );

      if (template) {
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          await this.docService.create({
            usrdoc_title: template?.template_name,
            usrdoc_description: template?.template_description,
            template_id: template?.template_id,
            user_id: element?.user_id,
            usrdoc_variables_data: templateUserData[index],
          });
        }
      } else {
        // send Emails
        for (const user of usersData) {
          await this.authService.send_onboarding_email(user.user_email);
        }
      }

      return { message: `Users created successfully!` };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error?.message || `Failed to create users`,
      );
    }
  }

  async generateSampleExcel(data: GenerateUserSampleExcel): Promise<any> {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Sheet1');

      let columns = [
        { header: 'firstname', key: 'firstname' },
        { header: 'middlename', key: 'middlename' },
        { header: 'lastname', key: 'lastname' },
        { header: 'user_email', key: 'user_email' },
        { header: 'date_of_joining', key: 'date_of_joining' },
        { header: 'role', key: 'role' },
        { header: 'user_device_id', key: 'user_device_id' },
      ];

      if (data?.templateId) {
        const template = await this.prisma.companyTemplate.findUnique({
          where: { template_id: data?.templateId },
        });

        if (!template) {
          throw new ConflictException('Template Not found');
        }

        for (let index = 0; index < template?.custom_variables.length; index++) {
          const element = template?.custom_variables[index];
          if (element !== 'sign') {
            columns = [...columns, { header: `template_${element}`, key: element }];
          }
        }
      }

      sheet.columns = columns;

      // Save the workbook to a local file
      const filePath = './data.xlsx';
      await workbook.xlsx.writeFile(filePath);

      return { message: 'User sample generated' };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || `Failed to create users ${error}`,
      );
    }
  }
}
