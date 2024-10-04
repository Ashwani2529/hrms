/*
  Warnings:

  - You are about to drop the column `standard_monthly_hours` on the `Company_Data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company_Data" DROP COLUMN "standard_monthly_hours",
ADD COLUMN     "standard_monthly_days" INTEGER;
