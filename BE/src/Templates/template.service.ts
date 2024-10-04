import { PrismaService } from 'src/prisma.service';
import { Remark, companyTemplate } from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTemplate, DeleteTemplate, UpdateTemplate } from './dto/template.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  template_predefind_variable_scopes = {
    USER: {
      user_email: 'Employee email',
      date_of_joining: 'Date of Joining',
      user_name: 'Employee Name',
      sign: 'Signature of Employee',
    },
  };

  async getTemplateVariableScopes() {
    try {
      return this.template_predefind_variable_scopes;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getAllTemplates(): Promise<any[]> {
    try {
      const template = await this.prisma.companyTemplate.findMany({
        // where:{template_id:{not:"9185b96c-8b3e-4e42-a5fb-899ddf2b66ag"}},
        select: {
          template_id: true,
          template_name: true,
          predefined_variables: true,
          custom_variables: true,
          template_description: true,
          createdAt: true,
        },
      });

      let allTemplates:any = template;

      if (
        template.filter(e => e.template_id === '9185b96c-8b3e-4e42-a5fb-899ddf2b66ag')
      ) {
        const defaultTemplate = template.find(
          e => e.template_id === '9185b96c-8b3e-4e42-a5fb-899ddf2b66ag',
        );
        allTemplates = template.filter(
          e => e.template_id !== '9185b96c-8b3e-4e42-a5fb-899ddf2b66ag',
        );
        allTemplates.push({ ...defaultTemplate, default: true });
      }

      return allTemplates;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async getTemplateById(id: string): Promise<companyTemplate> {
    try {
      const template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: id },
      });

      if (!template) {
        throw new ConflictException('Template not found');
      }

      return template;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async create(data: CreateTemplate): Promise<companyTemplate> {
    try {
      const variablePattern = /{{\s*[\w_]+\s*}}/g; // matches for varibale plaveholder like {{__}}
      const matches = data?.template_content_html?.match(variablePattern) || [];
      let variables = matches.map(match => match.replace(/{{\s*|\s*}}/g, ''));
      const varaiblesSet = new Set(variables);
      variables = Array.from(varaiblesSet);

      let predefined_variables = [];
      let custom_variables = [];

      for (let index = 0; index < data?.variable_scopes.length; index++) {
        const element = data?.variable_scopes[index];

        if (this.template_predefind_variable_scopes.hasOwnProperty(element)) {
          const predefined_array = Object.keys(
            this.template_predefind_variable_scopes[element],
          );

          predefined_variables = variables.filter(e => predefined_array.includes(e));
          custom_variables = variables.filter(e => !predefined_array.includes(e));
        } else {
          throw new ConflictException('Invalid variable scope');
        }
      }

      const template =  await this.prisma.handlePrismaError(this.prisma.companyTemplate.create({
        data: {
          ...data,
          predefined_variables: predefined_variables,
          custom_variables:
            predefined_variables?.length === 0 && custom_variables?.length === 0
              ? variables
              : custom_variables,
          require_sign: variables.includes('sign') ? true : false,
        },
      }));

      return template;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async update(id: string, data: UpdateTemplate | any): Promise<companyTemplate> {
    try {
      let template = await this.prisma.companyTemplate.findUnique({
        where: { template_id: id },
      });

      if (!template) {
        throw new ConflictException('Template not found');
      }

      if (data?.template_content && data?.template_content_html) {
        const variablePattern = /{{\s*[\w_]+\s*}}/g; // matches for varibale plaveholder like {{__}}
        const matches = data?.template_content_html?.match(variablePattern) || [];
        let variables = matches.map(match => match.replace(/{{\s*|\s*}}/g, ''));
        const varaiblesSet = new Set(variables);
        variables = Array.from(varaiblesSet);

        let predefined_variables = [];
        let custom_variables = [];

        const variable_scopes = data?.variable_scopes ?? template?.variable_scopes;

        for (let index = 0; index < variable_scopes.length; index++) {
          const element = variable_scopes[index];

          if (this.template_predefind_variable_scopes.hasOwnProperty(element)) {
            const predefined_array = Object.keys(
              this.template_predefind_variable_scopes[element],
            );

            predefined_variables = variables.filter(e => predefined_array.includes(e));
            custom_variables = variables.filter(e => !predefined_array.includes(e));
          } else {
            throw new ConflictException('Invalid variable scope');
          }
        }

        data.predefined_variables = predefined_variables;
        data.custom_variables = custom_variables;

        data.require_sign = variables.includes('sign') ? true : false;
      }

      template =  await this.prisma.handlePrismaError(this.prisma.companyTemplate.update({
        where: { template_id: id },
        data: data,
      }));

      return template;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }

  async delete(data: DeleteTemplate): Promise<any> {
    try {
      const templates =  await this.prisma.handlePrismaError(this.prisma.companyTemplate.deleteMany({
        where: {
          template_id: {
            in: data?.templates,
          },
        },
      }));

      if (templates.count === 0) {
        throw new ConflictException('Templates could not be deleted');
      }

      return {
        message: 'Templates deleted successfully',
        deletedTemplates: data.templates,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error?.message || 'Some error occured');
    }
  }
}
