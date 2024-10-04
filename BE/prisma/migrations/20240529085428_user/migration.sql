/*
  Warnings:

  - A unique constraint covering the columns `[emp_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emp_id" SERIAL;

-- CreateIndex
CREATE UNIQUE INDEX "User_emp_id_key" ON "User"("emp_id");
