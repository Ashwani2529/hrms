-- CreateEnum
CREATE TYPE "OT_PAY_TYPE" AS ENUM ('COMPUNSATORY_OFF', 'PAY_IN_SALARY');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "ot_pay_type" "OT_PAY_TYPE",
ADD COLUMN     "standarized_shift_hours" INTEGER;
