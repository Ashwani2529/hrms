-- AlterTable
ALTER TABLE "Payroll" ALTER COLUMN "payroll_status" SET DEFAULT 'Inactive',
ALTER COLUMN "payroll_frquency" DROP NOT NULL,
ALTER COLUMN "payroll_date" DROP NOT NULL;
