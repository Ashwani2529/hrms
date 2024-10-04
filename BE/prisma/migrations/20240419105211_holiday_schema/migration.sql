/*
  Warnings:

  - You are about to drop the column `parent_repeat_holiday` on the `Holiday` table. All the data in the column will be lost.
  - You are about to drop the column `repeat_id` on the `Holiday` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Holiday" DROP COLUMN "parent_repeat_holiday",
DROP COLUMN "repeat_id",
ADD COLUMN     "parent_holiday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeatId" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'Normal';
