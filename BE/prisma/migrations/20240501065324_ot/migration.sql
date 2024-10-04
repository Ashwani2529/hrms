-- AlterEnum
ALTER TYPE "ATTENDANCE_TYPE" ADD VALUE 'OVER_TIME';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "ot_hours" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaves_reset_values" JSONB;
