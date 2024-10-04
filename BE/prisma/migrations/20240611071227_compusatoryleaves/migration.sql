/*
  Warnings:

  - Added the required column `remaining_extra_hours` to the `Complementary_Leave` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complementary_Leave" ADD COLUMN     "remaining_extra_hours" INTEGER NOT NULL;
