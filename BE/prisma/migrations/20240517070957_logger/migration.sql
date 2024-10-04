/*
  Warnings:

  - You are about to drop the column `log` on the `Logger` table. All the data in the column will be lost.
  - Added the required column `log_attrib_name` to the `Logger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Logger" DROP COLUMN "log",
ADD COLUMN     "attrib_id" TEXT,
ADD COLUMN     "log_attrib_name" TEXT NOT NULL;
