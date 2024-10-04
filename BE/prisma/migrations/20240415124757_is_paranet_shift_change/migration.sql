/*
  Warnings:

  - Made the column `parent_repeat_shift` on table `Shift` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "parent_repeat_shift" SET NOT NULL;
