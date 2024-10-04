/*
  Warnings:

  - The values [EXPIRED] on the enum `LEAVE_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LEAVE_STATUS_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'LAPSED', 'GRANTED');
ALTER TABLE "Leave" ALTER COLUMN "leave_status" TYPE "LEAVE_STATUS_new" USING ("leave_status"::text::"LEAVE_STATUS_new");
ALTER TYPE "LEAVE_STATUS" RENAME TO "LEAVE_STATUS_old";
ALTER TYPE "LEAVE_STATUS_new" RENAME TO "LEAVE_STATUS";
DROP TYPE "LEAVE_STATUS_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lapsed_leaves" INTEGER NOT NULL DEFAULT 0;
