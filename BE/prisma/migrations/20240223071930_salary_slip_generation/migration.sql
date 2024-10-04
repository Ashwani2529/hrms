/*
  Warnings:

  - You are about to drop the column `salary_status` on the `Salary` table. All the data in the column will be lost.
  - Changed the type of `bonus_status` on the `Bonus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SALARY_SLIP_APPROVAL" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "PAID_STATUS" AS ENUM ('Pending', 'Paid', 'Cancelled');

-- AlterTable
ALTER TABLE "Bonus" DROP COLUMN "bonus_status",
ADD COLUMN     "bonus_status" "PAID_STATUS" NOT NULL;

-- AlterTable
ALTER TABLE "Payroll" ADD COLUMN     "salaryId" TEXT;

-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "salary_status";

-- DropEnum
DROP TYPE "SNB_STATUS";

-- CreateTable
CREATE TABLE "SalarySlip" (
    "salary_slip_id" TEXT NOT NULL,
    "payroll_id" TEXT NOT NULL,
    "salary_slip_approval" "SALARY_SLIP_APPROVAL" NOT NULL,
    "salary_slip_status" "PAID_STATUS" NOT NULL,
    "salary_slip_start_date" TIMESTAMP(3) NOT NULL,
    "salary_slip_end_date" TIMESTAMP(3) NOT NULL,
    "salary_slip_amount" TEXT NOT NULL,
    "currency_type" TEXT NOT NULL,
    "paid_leave_encashment" TEXT NOT NULL,
    "earnings" JSONB[],
    "incentive" JSONB[],
    "deduction" JSONB[],
    "bonuses" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalarySlip_pkey" PRIMARY KEY ("salary_slip_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlip_salary_slip_id_key" ON "SalarySlip"("salary_slip_id");

-- CreateIndex
CREATE UNIQUE INDEX "SalarySlip_payroll_id_key" ON "SalarySlip"("payroll_id");

-- AddForeignKey
ALTER TABLE "SalarySlip" ADD CONSTRAINT "SalarySlip_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "Payroll"("payroll_id") ON DELETE CASCADE ON UPDATE CASCADE;
