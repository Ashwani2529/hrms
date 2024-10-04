-- CreateEnum
CREATE TYPE "PAYROLL_STATUS" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "PAYROLL_FREQ" AS ENUM ('Monthly', 'Weekly', 'Daily', 'Hourly');

-- CreateEnum
CREATE TYPE "SNB_STATUS" AS ENUM ('Inactive', 'Active', 'Pending', 'Paid');

-- CreateEnum
CREATE TYPE "USER_SHIFT_STATUS" AS ENUM ('Leave_Conflict', 'Late_Conflict', 'Overlap_Conflict', 'None');

-- CreateEnum
CREATE TYPE "SHIFT_REPEAT" AS ENUM ('None', 'Daily', 'Weekly', 'Monthly', 'Custom');

-- CreateEnum
CREATE TYPE "SHIFT_STATUS" AS ENUM ('Unexpected', 'Conflicted', 'Resolved');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "SALUTAION" AS ENUM ('Mr', 'Mrs', 'Ms', 'Dr');

-- CreateEnum
CREATE TYPE "EMPLOYEMENT_TYPE" AS ENUM ('Full_Time', 'Part_Time', 'Contract', 'Internship');

-- CreateEnum
CREATE TYPE "HOLIDAY_TYPE" AS ENUM ('WEEKLY_OFF', 'PUBLIC_HOLIDAY');

-- CreateEnum
CREATE TYPE "LEAVE_TYPE" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "LEAVE_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LOG_TYPE" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "ATTENDANCE_TYPE" AS ENUM ('ABSENT', 'PRESENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "STATUS_TYPE" AS ENUM ('Active', 'Inactive', 'Suspended', 'Left');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL,
    "paid_leaves" INTEGER NOT NULL DEFAULT 0,
    "unpaid_leaves" INTEGER NOT NULL DEFAULT 0,
    "date_of_birth" TIMESTAMP(3),
    "gender" "GENDER",
    "salutation" "SALUTAION",
    "status" "STATUS_TYPE",
    "employement_type" "EMPLOYEMENT_TYPE",
    "profile_photo" TEXT,
    "user_addhar" TEXT,
    "user_PAN" TEXT,
    "firstname" TEXT,
    "middlename" TEXT,
    "lastname" TEXT,
    "personal_email" TEXT,
    "user_device_id" TEXT,
    "otp" TEXT,
    "isApproved" BOOLEAN DEFAULT false,
    "role_id" TEXT,
    "company_id" TEXT,
    "user_bank" JSONB,
    "user_address" JSONB,
    "user_documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Company" (
    "company_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_details" TEXT,
    "company_logo" TEXT,
    "country" TEXT,
    "currency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Role_permission" (
    "role_permission_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_flag_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_permission_pkey" PRIMARY KEY ("role_permission_id")
);

-- CreateTable
CREATE TABLE "Permission_flags" (
    "permission_flag_id" TEXT NOT NULL,
    "permission_flag_name" TEXT NOT NULL,
    "permission_flag_description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_flags_pkey" PRIMARY KEY ("permission_flag_id")
);

-- CreateTable
CREATE TABLE "User_shift" (
    "user_shift_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "USER_SHIFT_STATUS" NOT NULL DEFAULT 'None',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_shift_pkey" PRIMARY KEY ("user_shift_id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "shift_id" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "begin_checkin" INTEGER NOT NULL,
    "begin_checkout" INTEGER NOT NULL,
    "shift_color" TEXT,
    "auto_attendance" BOOLEAN,
    "status" "SHIFT_STATUS" NOT NULL DEFAULT 'Resolved',
    "client_id" TEXT,
    "custom_repeat" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repeat" "SHIFT_REPEAT" NOT NULL DEFAULT 'None',
    "parent_repeat_shift" BOOLEAN DEFAULT false,
    "repeat_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "Client" (
    "client_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_details" TEXT,
    "client_logo" TEXT,
    "day_hour_payment" INTEGER,
    "night_hour_payment" INTEGER,
    "day_hour_start" TIMESTAMP(3),
    "night_hour_start" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "Checkin" (
    "checkin_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shift_id" TEXT,
    "attendance_id" TEXT,
    "log_type" "LOG_TYPE" NOT NULL,
    "log_time" TIMESTAMP(3) NOT NULL,
    "device_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("checkin_id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "attendance_id" TEXT NOT NULL,
    "attendance_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ATTENDANCE_TYPE" NOT NULL,
    "shift_id" TEXT,
    "check_in_id" TEXT,
    "check_out_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "leave_id" TEXT NOT NULL,
    "leave_name" TEXT NOT NULL,
    "leave_description" TEXT,
    "leave_type" "LEAVE_TYPE" NOT NULL,
    "leave_status" "LEAVE_STATUS" NOT NULL,
    "leave_start_date" TIMESTAMP(3) NOT NULL,
    "leave_end_date" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("leave_id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "holiday_id" TEXT NOT NULL,
    "holiday_name" TEXT NOT NULL,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "holiday_type" "HOLIDAY_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("holiday_id")
);

-- CreateTable
CREATE TABLE "User_holiday" (
    "user_holiday_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "holiday_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_holiday_pkey" PRIMARY KEY ("user_holiday_id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "payroll_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payroll_status" "PAYROLL_STATUS" NOT NULL,
    "payroll_frquency" "PAYROLL_FREQ" NOT NULL,
    "payroll_date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("payroll_id")
);

-- CreateTable
CREATE TABLE "Bonus" (
    "bonus_id" TEXT NOT NULL,
    "payroll_id" TEXT NOT NULL,
    "bonus_status" "SNB_STATUS" NOT NULL,
    "bonus_date" TIMESTAMP(3) NOT NULL,
    "bonus_type" TEXT NOT NULL,
    "bonus_amount" TEXT NOT NULL,
    "currency_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bonus_pkey" PRIMARY KEY ("bonus_id")
);

-- CreateTable
CREATE TABLE "Salary" (
    "salary_id" TEXT NOT NULL,
    "payroll_id" TEXT NOT NULL,
    "salary_status" "SNB_STATUS" NOT NULL,
    "base_salary_amount" TEXT NOT NULL,
    "currency_type" TEXT NOT NULL,
    "earnings" JSONB[],
    "incentive" JSONB[],
    "deduction" JSONB[],
    "paid_leave_encashment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Salary_pkey" PRIMARY KEY ("salary_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_password_key" ON "User"("user_password");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_device_id_key" ON "User"("user_device_id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_company_id_key" ON "Company"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_id_key" ON "Role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_permission_role_permission_id_key" ON "Role_permission"("role_permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_flags_permission_flag_id_key" ON "Permission_flags"("permission_flag_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_shift_user_shift_id_key" ON "User_shift"("user_shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_shift_id_key" ON "Shift"("shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "Client_client_id_key" ON "Client"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Checkin_checkin_id_key" ON "Checkin"("checkin_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_attendance_id_key" ON "Attendance"("attendance_id");

-- CreateIndex
CREATE UNIQUE INDEX "Leave_leave_id_key" ON "Leave"("leave_id");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_holiday_id_key" ON "Holiday"("holiday_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_holiday_user_holiday_id_key" ON "User_holiday"("user_holiday_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_payroll_id_key" ON "Payroll"("payroll_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_user_id_key" ON "Payroll"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bonus_bonus_id_key" ON "Bonus"("bonus_id");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_salary_id_key" ON "Salary"("salary_id");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_payroll_id_key" ON "Salary"("payroll_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("company_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_permission" ADD CONSTRAINT "Role_permission_permission_flag_id_fkey" FOREIGN KEY ("permission_flag_id") REFERENCES "Permission_flags"("permission_flag_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role_permission" ADD CONSTRAINT "Role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_shift" ADD CONSTRAINT "User_shift_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("shift_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_shift" ADD CONSTRAINT "User_shift_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "Attendance"("attendance_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("shift_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkin" ADD CONSTRAINT "Checkin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("shift_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_holiday" ADD CONSTRAINT "User_holiday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_holiday" ADD CONSTRAINT "User_holiday_holiday_id_fkey" FOREIGN KEY ("holiday_id") REFERENCES "Holiday"("holiday_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bonus" ADD CONSTRAINT "Bonus_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "Payroll"("payroll_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Salary" ADD CONSTRAINT "Salary_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "Payroll"("payroll_id") ON DELETE CASCADE ON UPDATE CASCADE;
