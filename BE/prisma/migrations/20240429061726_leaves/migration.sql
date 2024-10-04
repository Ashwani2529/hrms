/*
  Warnings:

  - The values [PAID] on the enum `LEAVE_TYPE` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paid_leaves` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LEAVE_TYPE_new" AS ENUM ('SICK', 'EARNED', 'CASUAL', 'COMPUNSATORY', 'UNPAID');
ALTER TABLE "Leave" ALTER COLUMN "leave_type" TYPE "LEAVE_TYPE_new" USING ("leave_type"::text::"LEAVE_TYPE_new");
ALTER TYPE "LEAVE_TYPE" RENAME TO "LEAVE_TYPE_old";
ALTER TYPE "LEAVE_TYPE_new" RENAME TO "LEAVE_TYPE";
DROP TYPE "LEAVE_TYPE_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "paid_leaves",
ADD COLUMN     "casual_leaves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "compunsatory_leaves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "earned_leaves" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sick_leaves" INTEGER NOT NULL DEFAULT 0;
