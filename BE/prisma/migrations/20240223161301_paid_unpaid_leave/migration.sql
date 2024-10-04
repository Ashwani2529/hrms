/*
  Warnings:

  - The values [LEAVE] on the enum `ATTENDANCE_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ATTENDANCE_TYPE_new" AS ENUM ('ABSENT', 'PRESENT', 'HALF_DAY', 'PAID_LEAVE', 'UNPAID_LEAVE', 'HOLIDAY');
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "ATTENDANCE_TYPE_new" USING ("status"::text::"ATTENDANCE_TYPE_new");
ALTER TYPE "ATTENDANCE_TYPE" RENAME TO "ATTENDANCE_TYPE_old";
ALTER TYPE "ATTENDANCE_TYPE_new" RENAME TO "ATTENDANCE_TYPE";
DROP TYPE "ATTENDANCE_TYPE_old";
COMMIT;

-- AlterEnum
ALTER TYPE "SALARY_TYPE" ADD VALUE 'Monthly';
