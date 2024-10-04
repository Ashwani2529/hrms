/*
  Warnings:

  - You are about to drop the column `request_date` on the `Tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tickets" DROP COLUMN "request_date",
ADD COLUMN     "ticket_date" TIMESTAMP(3);
