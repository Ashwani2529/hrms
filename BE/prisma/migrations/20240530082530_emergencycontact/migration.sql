/*
  Warnings:

  - The `emergency_contacts_data` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emergency_contacts_data",
ADD COLUMN     "emergency_contacts_data" JSONB[];
