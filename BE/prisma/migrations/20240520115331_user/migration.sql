/*
  Warnings:

  - The `usrdoc_variables_data` column on the `userDocs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "userDocs" DROP COLUMN "usrdoc_variables_data",
ADD COLUMN     "usrdoc_variables_data" JSONB;
