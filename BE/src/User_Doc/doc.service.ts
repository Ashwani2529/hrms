import { PrismaService } from 'src/prisma.service';
import { DOCS_STATUS_TYPE, Remark, companyTemplate, userDocs } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateDoc,
  updateDoc,
  DeleteDocs,
  SignDoc,
  GenerateDocSampleExcel,
} from './dto/doc.dto';
import { JwtService } from '@nestjs/jwt';
import { emailConfig } from 'src/Config/emailConfig';
import { htmlToPdfBuffer } from 'src/Config/common';
import { NotificationGateway } from 'src/Notification/gateway/notification.gateway';
import { AuthService } from 'src/Auth/auth.service';
import { uploadPdfBuffer } from 'src/Config/getPresignedUrl';
import { TemplateService } from 'src/Templates/template.service';
import * as ExcelJS from 'exceljs';
import moment from 'moment';

@Injectable()
export class DocService {
  constructor(
    private notiGate: NotificationGateway,
    private jwtService: JwtService,
    private templateService: TemplateService,
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  replaceVariables(htmlString, replacements) {
    return htmlString.replaceAll(/{{\s*([\w_]+)\s*}}/g, (match, p1) => {
      return replacements.hasOwnProperty(p1) ? replacements[p1] : match;
    });
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async getAllDocs(
    search: string,
    status: DOCS_STATUS_TYPE,
    page: string,
    limit: string,
    userId?: string,
  ): Promise<any> {
    try {
      const query: any = {
        include: {
          user: {
            select: {
              user_name: true,
              user_id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      };

      let where: any = {
        usrdoc_title: {
          contains: search,
          mode: 'insensitive',
        },
      };

      if (userId) {
        where = {
          ...where,
          user_id: userId,
        };
      }

      if (status) {
        where = {
          ...where,
          usrdoc_status: status,
        };
      }

      if (page && limit) query.skip = (parseInt(page) - 1) * parseInt(limit);
      if (limit) query.take = parseInt(limit);

      query.where = where;

      const totalDocs = await this.prisma.userDocs.count({ where });
      const docs = await this.prisma.userDocs.findMany(query);

      return { totalDocs, docs };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateDoc): Promise<userDocs> {
    try {
      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: data?.template_id },
      });

      if (!template) {
        throw new ConflictException('Template not found');
      }

      const user = await this.prisma.user.findUnique({
        where: { user_id: data?.user_id },
      });

      if (!user) {
        throw new ConflictException('User not found');
      }

      //  automaticatically prefills the values
      for (let index = 0; index < template?.predefined_variables?.length; index++) {
        const element = template?.predefined_variables[index];

        template?.variable_scopes?.forEach(e => {
          if (
            this.templateService.template_predefind_variable_scopes[e].hasOwnProperty(
              element,
            )
          ) {
            if (['date_of_joining'].includes(element)) {
              data.usrdoc_variables_data[element] = new Date(
                user[element],
              ).toDateString();
            } else {
              data.usrdoc_variables_data[element] = user[element];
            }
          }
        });
      }

      if (
        ![...template?.predefined_variables, ...template?.custom_variables]?.some(e =>
          Object.keys(data?.usrdoc_variables_data).includes(e),
        )
      ) {
        throw new ConflictException('All template varibles not found');
      }

      let docs: userDocs = null;

      if (template?.require_sign) {
        docs = await this.prisma.handlePrismaError(
          this.prisma.userDocs.create({
            data: {
              ...data,
              usrdoc_status: 'PENDING',
            },
          }),
        );

        // send email to user to sign the doc
        if (docs?.usrdoc_status === 'PENDING') {
          const payload = {
            doc_id: docs?.usrdoc_id,
            expiryTime: Date.now() + 2* 24 * 60 * 60 * 1000,
            user_email: user?.user_email,
          };

          const token = this.jwtService.sign(payload);

          const htmlContent = this.replaceVariables(
            template?.template_content_html,
            docs?.usrdoc_variables_data,
          );

          const additionalInfo = `<h3>Digitally Accept the ${data?.usrdoc_title} by signing the document at the <a href=${
            process.env.BASE_FRONTEND_URL +
            '/employees/digital-sign' +
            '?docToken=' +
            token
          }>link</a> </h3> <h3>The link will expire on ${new Date(Date.now() + 2* 24 * 60 * 60 * 1000).toUTCString()}</h3>`;


          // send email to the email to sign the doc ------------

          const transporter: any = await emailConfig();
          const message = {
            from: 'Heliverse pm@heliverse.com',
            to: user?.user_email,
            subject: `Signon to your ${data?.usrdoc_title}`,
            html: `${htmlContent + additionalInfo}`
            // html:
            //   `<h3>Digitally Accept the ${data?.usrdoc_title} by visting the link </h3>` +
            //   "<h1 style='font-weight:bold;'>" +
            //   process.env.BASE_FRONTEND_URL +
            //   '/employees/digital-sign' +
            //   '?docToken=' +
            //   token +
            //   '</h1>' +
            //   `<h3>The link will expire on ${new Date(Date.now() + 2* 24 * 60 * 60 * 1000).toUTCString()}</h3>`,
          };

          await transporter.sendMail(message);
        }
      } else {
        docs = await this.prisma.handlePrismaError(
          this.prisma.userDocs.create({
            data: {
              ...data,
              usrdoc_status: 'APPROVED',
            },
          }),
        );

        const updatedHtml = this.replaceVariables(
          template?.template_content_html,
          docs?.usrdoc_variables_data,
        );

        const pdfContent = await htmlToPdfBuffer(updatedHtml);
        const key = docs?.usrdoc_title + '_' + Date.now();

        const s3Data = await uploadPdfBuffer(key, pdfContent, 'application/pdf');

        if (s3Data?.$metadata?.httpStatusCode === 200) {
          await this.prisma.handlePrismaError(
            this.prisma.userDocs.update({
              where: { usrdoc_id: docs?.usrdoc_id },
              data: {
                usrdoc_pdf_url: key,
              },
            }),
          );
        }

        // mail to the user the copy signed letter ------------
        const options = {
          from: 'Heliverse',
          subject: `Recieved ${docs?.usrdoc_title}`,
          to: user?.user_email,
          html:
            `<p>Hi ${user?.user_name},</p>` +
            '<p>' +
            'Please find the attached document of ' +
            docs?.usrdoc_title +
            '</p>',
          attachments: [
            {
              filename: `${docs?.usrdoc_title}.pdf`,
              content: pdfContent,
            },
          ],
        };

        const transporter: any = await emailConfig();
        await transporter.sendMail(options);
      }

      return docs;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Some error occured while sending document',
      );
    }
  }

  async verifyDocToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);

      if (!payload) {
        throw new ConflictException('Invalid Token');
      }

      if (payload?.expiryTime < Date.now()) {
        throw new ConflictException('Token has been expired');
      }

      // parse html with the same data ------------
      const userDoc = await this.prisma.userDocs.findUnique({
        where: { usrdoc_id: payload?.doc_id },
        include: {
          template: true,
        },
      });

      if (!userDoc || userDoc.usrdoc_status !== 'PENDING') {
        throw new ConflictException('Document not found!!!');
      }

      const htmlContent = this.replaceVariables(
        userDoc?.template?.template_content_html,
        userDoc?.usrdoc_variables_data,
      );

      return htmlContent;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Some error occured while verifying the token',
      );
    }
  }

  async signTheDoc(
    token: string,
    signature: SignDoc,
    code: string,
    ip: string,
  ): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const signDate = new Date();

      if (!payload) {
        throw new ConflictException('Invalid Token');
      }

      if (payload?.expiryTime < Date.now()) {
        throw new ConflictException('Token has been expired');
      }

      const cachedOtpData = await this.prisma.user.findUnique({
        where: { user_email: payload?.user_email },
      });

      if (!cachedOtpData || !cachedOtpData?.otp) {
        throw new BadRequestException('Invalid token');
      }

      const arr = cachedOtpData?.otp.split('_');
      const cachedOtp = arr[0];
      const cachedExpiryTime = parseInt(arr[1]);

      if (cachedOtpData && cachedOtp !== code) {
        throw new BadRequestException('Invalid OTP');
      }

      if (cachedExpiryTime < Date.now()) {
        throw new BadRequestException('OTP Expired!!');
      }

      // nullify the otp -----------
      await this.prisma.handlePrismaError(
        this.prisma.user.update({
          where: { user_email: payload?.user_email },
          data: {
            otp: null,
          },
        }),
      );

      // parse html with the same data ------------
      const userDoc = await this.prisma.userDocs.findUnique({
        where: { usrdoc_id: payload?.doc_id },
        include: {
          template: true,
          user: true,
        },
      });

      if (!userDoc || userDoc.usrdoc_status !== 'PENDING') {
        throw new ConflictException('Document not found!!!');
      }

      let updatedHtml = this.replaceVariables(
        userDoc?.template?.template_content_html,
        userDoc?.usrdoc_variables_data,
      );

      const base64 = signature?.buffer?.toString('base64');
      const signDataUrl = `data:image/png;base64,${base64}`;

      updatedHtml = updatedHtml.replaceAll(
        /{{\s*sign\s*}}/g,
        `<img src='${signDataUrl}' alt='Signature' style='max-width: 120px; width:100%; aspect-ratio: 120/52; display: inline; object-fit:contain; object-position:bottom;' /> `,
      );

      const additionalInfo = `<div style='font-size:10px;'><p>Date: ${new Date(signDate).toDateString()}</p><p>Time: ${new Date(signDate).toTimeString()}</p><p>IP Address: ${ip}</p></div>`;

      updatedHtml += additionalInfo;

      const pdfContent = await htmlToPdfBuffer(updatedHtml);
      const key = userDoc?.usrdoc_title + '_' + Date.now();

      const s3Data = await uploadPdfBuffer(key, pdfContent, 'application/pdf');

      if (s3Data?.$metadata?.httpStatusCode === 200) {
        await this.prisma.handlePrismaError(
          this.prisma.userDocs.update({
            where: { usrdoc_id: userDoc?.usrdoc_id },
            data: {
              usrdoc_pdf_url: key,
              signedAt: new Date(signDate),
              user_ip: ip,
              usrdoc_status: 'SIGNED',
            },
          }),
        );
      }

      // mail to the user the copy signed letter ------------
      const options = {
        from: 'Heliverse',
        subject: `Your Signed Document Copy`,
        to: userDoc?.user?.user_email,
        html:
          `<p>Hi ${userDoc?.user?.user_name},</p>` +
          '<p>' +
          'Please check the copy of your ' +
          userDoc?.usrdoc_title +
          ' submission in the email attachments.' +
          '</p>',
        attachments: [
          {
            filename: `${userDoc?.usrdoc_title}.pdf`,
            content: pdfContent,
          },
        ],
      };

      const transporter: any = await emailConfig();
      await transporter.sendMail(options);

      await this.notiGate.handlesSendNotification({
        title: `Signed ${userDoc?.usrdoc_title}`,
        description: 'Review the signed letter',
        notification_type: 'Letter',
        notification_status: 'Pending',
        roles: ['ADMIN', 'HR'],
        userId: null,
      });

      return {
        message: 'Signature Verified Successfully!',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Some error occured while signing the doc',
      );
    }
  }

  async update(id: string, data: updateDoc): Promise<userDocs> {
    try {
      let docs = await this.prisma.userDocs.findUnique({
        where: { usrdoc_id: id },
        include: {
          user: true,
          template: true,
        },
      });

      if (!docs) {
        throw new ConflictException('Document not found');
      }

      if (data.update_type === 'NORMAL') {
        if (
          docs?.usrdoc_status === 'APPROVED' ||
          docs?.usrdoc_status === 'REJECTED' ||
          docs?.usrdoc_status === 'SIGNED'
        ) {
          throw new ConflictException(
            'Document has already been ' + docs?.usrdoc_status + 'you cannot update it',
          );
        }

        delete data?.update_type;

        await this.prisma.handlePrismaError(
          this.prisma.userDocs.update({
            where: { usrdoc_id: id },
            data: data,
          }),
        );
      } else if (data.update_type === 'APPROVED') {
        await this.prisma.handlePrismaError(
          this.prisma.userDocs.update({
            where: { usrdoc_id: id },
            data: {
              usrdoc_status: 'APPROVED',
            },
          }),
        );

        // send approval email and next onboaring emails to the user
        await this.authService.send_onboarding_email(docs?.user?.user_email);
      } else if (data.update_type === 'REJECTED') {
        await this.prisma.handlePrismaError(
          this.prisma.userDocs.update({
            where: { usrdoc_id: id },
            data: {
              usrdoc_status: 'REJECTED',
            },
          }),
        );

        // send rejection email and retry mail to user
        const transporter: any = await emailConfig();
        const message = {
          from: 'Heliverse pm@heliverse.com',
          to: docs?.user?.user_email,
          subject: `Digital Sign Rejected`,
          html: `<h3>Your recently signed Digital Document named <strong>${docs?.usrdoc_title || docs?.template?.template_name}</strong> has been rejcted. Please Contact the administration for further process.</h3>`,
        };

        await transporter.sendMail(message);
      }

      return docs;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteDocs): Promise<any> {
    try {
      const docs = await this.prisma.handlePrismaError(
        this.prisma.userDocs.deleteMany({
          where: {
            template_id: {
              in: data?.docs,
            },
          },
        }),
      );

      if (docs.count === 0) {
        throw new ConflictException('Templates could not be deleted');
      }

      return {
        message: 'Docs deleted successfully',
        deletedLeaves: data.docs,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async generateSampleExcel(data: GenerateDocSampleExcel): Promise<any> {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Sheet1');

      let columns = [
        { header: `Employee id`, key: 'emp_id' },
        { header: `Employee Name`, key: 'user_name' },
      ];

      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: data?.template_id },
      });

      if (!template) {
        throw new ConflictException('Template Not found');
      }

      for (let index = 0; index < template?.custom_variables.length; index++) {
        const element = template?.custom_variables[index];
        if (element !== 'sign') {
          columns = [...columns, { header: element, key: element }];
        }
      }

      sheet.columns = columns;

      const userData = await this.prisma.user.findMany({
        where: {
          user_id: {
            in: data?.userIds,
          },
        },
      });

      userData?.forEach(user => {
        sheet.addRow({
          emp_id: user?.emp_id,
          user_name: user?.user_name,
        });
      });

      // Save the workbook to a local file
      const filePath = './data.xlsx';
      await workbook.xlsx.writeFile(filePath);

      return { message: 'Document sample generated' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async createMultipleDoc(file: Buffer, templateId: string): Promise<any> {
    try {
      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: templateId },
      });

      const columnIds = ['emp_id', 'user_name'];

      // no custom variables
      if (template.custom_variables.length === 0) {
        throw new BadRequestException('Selected Template needs no file');
      }

      // have custom variables ---------
      if (!file) {
        throw new BadRequestException('Excel file is required');
      }

      const buffer = Buffer.from(file.buffer as ArrayBuffer);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.getWorksheet(1);
      const usersData = [];

      //getting columns header and removing non string values if any
      const columnHeaders: string[] = (
        worksheet.getRow(1).values as Array<string | null>
      )
        .filter(value => typeof value === 'string' && value !== null)
        .map((value, index) => columnIds[index] ?? (value as string));

      worksheet.eachRow(async (row, rowNumber) => {
        const rowData: Record<string, any> = {};
        if (rowNumber === 1) {
          // Skiping first row (header information)
          return;
        }

        // Iterating over columns headers and getting values of all headers
        columnHeaders.forEach((header: any, columnIndex: number) => {
          const cellValue = row.getCell(columnIndex + 1).value;

          if (cellValue && typeof cellValue === 'object') {
            if ('text' in cellValue) {
              rowData[header] = cellValue.text;
            } else {
              // Handling other object formats if needed
              rowData[header] = cellValue.toString();
            }
          } else {
            rowData[header] = cellValue;
          }
        });

        // Validating mandatory fields
        const mandatoryFields = [
          'emp_id',
          'user_name',
          ...template?.custom_variables?.filter(e => {
            e !== 'sign';
          }),
        ];

        for (const field of mandatoryFields) {
          if (!rowData[field]) {
            throw new BadRequestException(
              `Mandatory field "${field}" is missing in row ${rowNumber}`,
            );
          }
        }

        usersData.push(rowData);
      });

      for (let index = 0; index < usersData.length; index++) {
        const element = usersData[index];
        const user = await this.prisma.user.findUnique({
          where: { emp_id: element?.emp_id },
        });
        usersData[index].user_id = user?.user_id;
      }

      for (let index = 0; index < usersData?.length; index++) {
        const element = usersData[index];
        await this.create({
          usrdoc_title: template?.template_name,
          usrdoc_description: template?.template_description,
          template_id: template?.template_id,
          user_id: element?.user_id,
          usrdoc_variables_data: element,
        });
      }

      return { message: `Docs Created Successfully!` };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || `Failed to create docs ${error}`,
      );
    }
  }

  async createMultipleDocWithoutFile(
    templateId: string,
    userIds?: string[],
  ): Promise<any> {
    try {
      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: templateId },
      });

      // no custom variables
      if (!(template.custom_variables.length === 0)) {
        throw new BadRequestException('Template need custom variable values');
      }

      for (let index = 0; index < userIds?.length; index++) {
        const element = userIds[index];
        await this.create({
          usrdoc_title: template?.template_name,
          usrdoc_description: template?.template_description,
          template_id: template?.template_id,
          user_id: element,
          usrdoc_variables_data: {},
        });
      }

      return { message: `Docs Created Successfully!` };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || `Failed to create docs ${error}`,
      );
    }
  }
}
