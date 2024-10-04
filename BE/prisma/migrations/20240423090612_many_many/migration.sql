/*
  Warnings:

  - The primary key for the `User_holiday` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "User_holiday" DROP CONSTRAINT "User_holiday_pkey",
ADD CONSTRAINT "User_holiday_pkey" PRIMARY KEY ("user_id", "holiday_id");
