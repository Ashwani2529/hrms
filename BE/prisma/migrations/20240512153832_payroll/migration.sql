/*
  Warnings:

  - You are about to drop the column `salaryId` on the `Payroll` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "salaryId";

-- AlterTable
ALTER TABLE "SalarySlip" ADD COLUMN     "salary_id" TEXT;
