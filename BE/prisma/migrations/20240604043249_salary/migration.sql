/*
  Warnings:

  - Added the required column `holidays` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ot_hours` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paid_leave_days` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalarySlip" ADD COLUMN     "holidays" INTEGER NOT NULL,
ADD COLUMN     "ot_hours" INTEGER NOT NULL,
ADD COLUMN     "paid_leave_days" INTEGER NOT NULL;
