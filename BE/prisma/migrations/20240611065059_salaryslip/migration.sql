/*
  Warnings:

  - You are about to drop the column `company_id` on the `SalarySlip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SalarySlip" DROP COLUMN "company_id",
ADD COLUMN     "company_history_id" TEXT[];
