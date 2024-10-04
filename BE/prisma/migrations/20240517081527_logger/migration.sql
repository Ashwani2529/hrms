/*
  Warnings:

  - Added the required column `Entity_name` to the `Logger` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LOGGER_ENTITY_TYPE" AS ENUM ('SHIFT', 'ATTENDANCE', 'HOLIDAY', 'PAYROLL', 'LEAVE');

-- AlterTable
ALTER TABLE "Logger" ADD COLUMN     "Entity_name" "LOGGER_ENTITY_TYPE" NOT NULL;
