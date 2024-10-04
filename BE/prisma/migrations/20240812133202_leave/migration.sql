/*
  Warnings:

  - The `request_status` column on the `Requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ticket_status` column on the `Tickets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "REQUEST_STATUS" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LEAVE_STATUS" ADD VALUE 'REFUNDED';
ALTER TYPE "LEAVE_STATUS" ADD VALUE 'LAPSED';
ALTER TYPE "LEAVE_STATUS" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Requests" DROP COLUMN "request_status",
ADD COLUMN     "request_status" "REQUEST_STATUS" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Tickets" DROP COLUMN "ticket_status",
ADD COLUMN     "ticket_status" "REQUEST_STATUS" NOT NULL DEFAULT 'PENDING';
