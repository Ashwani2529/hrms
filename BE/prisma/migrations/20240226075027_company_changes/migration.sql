/*
  Warnings:

  - Added the required column `company_address` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Made the column `date_of_joining` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "company_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_pf" JSONB,
ALTER COLUMN "date_of_joining" SET NOT NULL;
