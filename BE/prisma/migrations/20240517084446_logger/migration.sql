/*
  Warnings:

  - The `attrib_id` column on the `Logger` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Logger" DROP COLUMN "attrib_id",
ADD COLUMN     "attrib_id" TEXT[];
