-- AlterEnum
ALTER TYPE "PAYROLL_FREQUENCY" ADD VALUE 'Hourly';

-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "payroll_frequency" SET DEFAULT 'Monthly';
