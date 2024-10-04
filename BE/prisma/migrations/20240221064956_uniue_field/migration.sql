/*
  Warnings:

  - A unique constraint covering the columns `[payroll_id]` on the table `Bonus` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Salary" ALTER COLUMN "salary_from_date" DROP NOT NULL,
ALTER COLUMN "salary_to_date" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bonus_payroll_id_key" ON "Bonus"("payroll_id");
