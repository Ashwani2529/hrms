/*
  Warnings:

  - You are about to drop the column `user_pf` on the `User` table. All the data in the column will be lost.
  - Added the required column `leave_days` to the `SalarySlip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalarySlip" ADD COLUMN     "leave_days" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "user_pf";
