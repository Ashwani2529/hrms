/*
  Warnings:

  - The `salary_slip_freq` column on the `SalarySlip` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SalarySlip" ADD COLUMN     "company_id" TEXT[],
ADD COLUMN     "complementary_leaves_number" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "salary_slip_freq",
ADD COLUMN     "salary_slip_freq" "PAYROLL_FREQUENCY" NOT NULL DEFAULT 'Monthly';
