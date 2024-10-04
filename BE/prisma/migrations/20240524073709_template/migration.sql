/*
  Warnings:

  - You are about to drop the column `template_variables` on the `CompanyTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyTemplate" DROP COLUMN "template_variables",
ADD COLUMN     "custom_variables" TEXT[],
ADD COLUMN     "predefined_variables" TEXT[],
ADD COLUMN     "variable_scopes" TEXT[];
