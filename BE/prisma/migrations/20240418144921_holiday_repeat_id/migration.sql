-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "parent_repeat_holiday" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeat_id" TEXT;
