/*
  Warnings:

  - You are about to drop the column `user_PAN` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `user_addhar` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "user_PAN",
DROP COLUMN "user_addhar",
ADD COLUMN     "emergency_contacts_data" JSONB,
ADD COLUMN     "user_permanent_address" JSONB,
ALTER COLUMN "emp_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "userDocs" ADD COLUMN     "signedAt" TIMESTAMP(3),
ADD COLUMN     "user_ip" TEXT;
