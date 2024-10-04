/*
  Warnings:

  - You are about to drop the column `user_email` on the `Logger` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Logger" DROP COLUMN "user_email",
ADD COLUMN     "previousData" JSONB,
ADD COLUMN     "updateData" JSONB;
