/*
  Warnings:

  - The values [WEEKLY_OFF,PUBLIC_HOLIDAY] on the enum `HOLIDAY_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HOLIDAY_TYPE_new" AS ENUM ('ONE_TIME', 'RECURRING');
ALTER TABLE "Holiday" ALTER COLUMN "holiday_type" TYPE "HOLIDAY_TYPE_new" USING ("holiday_type"::text::"HOLIDAY_TYPE_new");
ALTER TYPE "HOLIDAY_TYPE" RENAME TO "HOLIDAY_TYPE_old";
ALTER TYPE "HOLIDAY_TYPE_new" RENAME TO "HOLIDAY_TYPE";
DROP TYPE "HOLIDAY_TYPE_old";
COMMIT;

-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "custom_repeat" TEXT[] DEFAULT ARRAY[]::TEXT[];
