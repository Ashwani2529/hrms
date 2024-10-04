/*
  Warnings:

  - Changed the type of `bonus_amount` on the `Bonus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `base_salary_type` to the `Salary` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `base_salary_amount` on the `Salary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `paid_leave_encashment` to the `Salary` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `salary_slip_amount` on the `SalarySlip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `paid_leave_encashment` on the `SalarySlip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SALARY_TYPE" AS ENUM ('Hourly', 'Daily');

-- AlterTable
ALTER TABLE "Bonus" DROP COLUMN "bonus_amount",
ADD COLUMN     "bonus_amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Salary" ADD COLUMN     "base_salary_type" "SALARY_TYPE" NOT NULL,
DROP COLUMN "base_salary_amount",
ADD COLUMN     "base_salary_amount" INTEGER NOT NULL,
DROP COLUMN "paid_leave_encashment",
ADD COLUMN     "paid_leave_encashment" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SalarySlip" DROP COLUMN "salary_slip_amount",
ADD COLUMN     "salary_slip_amount" INTEGER NOT NULL,
DROP COLUMN "paid_leave_encashment",
ADD COLUMN     "paid_leave_encashment" INTEGER NOT NULL;
