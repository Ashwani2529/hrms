import { Module } from '@nestjs/common';

// HELPER MODULES
import { TasksModule } from './CronTask/task.module';
import { ScheduleModule } from '@nestjs/schedule';

// ROUTE MODULES
import { PrismaService } from './prisma.service';
import { AuthModule } from './Auth/auth.module';
import { UserModule } from './User/user.module';
import { ShiftModule } from './Shift/shift.module';
import { RoleModule } from './Role/role.module';
import { CompanyModule } from './Company/company.module';
import { CheckinModule } from './Checkin/checkin.module';
import { PflagModule } from './Permission_flag/pflag.module';
import { AttendanceModule } from './Attendance/attendance.module';
import { LeaveModule } from './Leave/leave.module';
import { HolidayModule } from './Holiday/holiday.module';
import { ClientModule } from './Client/client.module';
import { AnalyticsModule } from './Analytics/analytics.module';
import { LoggerModule } from './Logger/logger.module';
import { NotificationModule } from './Notification/notification.module';
// GUARDS
import { JwtAuthGuard } from './Auth/guards/jwt.guard';
import { RolesGuard } from './Auth/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { PayrollModule } from './Payroll/payroll.module';
import { RemarkModule } from './Remark/remark.module';
import { TemplateModule } from './Templates/template.module';
import { DocModule } from './User_Doc/doc.module';
import { RequestsModule } from './Requests/requests.module';
import { TicketsModule } from './Tickets/tickets.module';

@Module({
  imports: [
    // HELPER MODULES
    ScheduleModule.forRoot(),
    TasksModule,

    // ROUTE MODULES
    AuthModule,
    ShiftModule,
    UserModule,
    RoleModule,
    CompanyModule,
    CheckinModule,
    PflagModule,
    AttendanceModule,
    LeaveModule,
    HolidayModule,
    ClientModule,
    AnalyticsModule,
    PayrollModule,
    LoggerModule,
    NotificationModule,
    RemarkModule,
    TemplateModule,
    DocModule,
    RequestsModule,
    TicketsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    PrismaService,
  ],
})
export class AppModule {}

