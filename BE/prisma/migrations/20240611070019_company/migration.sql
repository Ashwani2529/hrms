/*
  Warnings:

  - You are about to drop the column `complementary_leaves_number` on the `SalarySlip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SalarySlip" DROP COLUMN "complementary_leaves_number",
ADD COLUMN     "complementary_leaves_days" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "extra_complementary_leave_hours" INTEGER NOT NULL DEFAULT 0;
