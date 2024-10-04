/*
  Warnings:

  - You are about to drop the column `payroll_date` on the `Payroll` table. All the data in the column will be lost.
  - You are about to drop the column `payroll_frquency` on the `Payroll` table. All the data in the column will be lost.
  - Added the required column `payroll_start_date` to the `Payroll` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_from_date` to the `Salary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_to_date` to the `Salary` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PAYROLL_FREQUENCY" AS ENUM ('Weekly', 'Monthly');

-- AlterTable
ALTER TABLE "Payroll" DROP COLUMN "payroll_date",
DROP COLUMN "payroll_frquency",
ADD COLUMN     "payroll_frequency" "PAYROLL_FREQUENCY",
ADD COLUMN     "payroll_start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Salary" ADD COLUMN     "salary_from_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "salary_to_date" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "PAYROLL_FREQ";
