/*
  Warnings:

  - You are about to drop the column `base_salary_type` on the `Salary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company_Data" ADD COLUMN     "salary_freq" "SALARY_TYPE" NOT NULL DEFAULT 'Monthly';

-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "base_salary_type";
