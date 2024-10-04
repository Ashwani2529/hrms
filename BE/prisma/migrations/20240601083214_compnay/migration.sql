/*
  Warnings:

  - You are about to drop the column `ot_pay_type` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `standarized_shift_hours` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "ot_pay_type",
DROP COLUMN "standarized_shift_hours";

-- CreateTable
CREATE TABLE "Company_Data" (
    "companydata_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "ot_pay_type" "OT_PAY_TYPE",
    "standarized_shift_hours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_Data_pkey" PRIMARY KEY ("companydata_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_Data_companydata_id_key" ON "Company_Data"("companydata_id");

-- AddForeignKey
ALTER TABLE "Company_Data" ADD CONSTRAINT "Company_Data_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("company_id") ON DELETE CASCADE ON UPDATE CASCADE;
