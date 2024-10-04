/*
  Warnings:

  - You are about to drop the column `salary_slip_amount` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `salary_slip_end_date` on the `SalarySlip` table. All the data in the column will be lost.
  - You are about to drop the column `salary_slip_start_date` on the `SalarySlip` table. All the data in the column will be lost.
  - Added the required column `base_salary` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_from_date` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_to_date` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_total_amount` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_total_deduction` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_total_earning` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary_slip_total_incentive` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `working_days` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalarySlip" DROP COLUMN "salary_slip_amount",
DROP COLUMN "salary_slip_end_date",
DROP COLUMN "salary_slip_start_date",
ADD COLUMN     "base_salary" INTEGER NOT NULL,
ADD COLUMN     "salary_slip_from_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "salary_slip_to_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "salary_slip_total_amount" INTEGER NOT NULL,
ADD COLUMN     "salary_slip_total_deduction" INTEGER NOT NULL,
ADD COLUMN     "salary_slip_total_earning" INTEGER NOT NULL,
ADD COLUMN     "salary_slip_total_incentive" INTEGER NOT NULL,
ADD COLUMN     "working_days" INTEGER NOT NULL;
