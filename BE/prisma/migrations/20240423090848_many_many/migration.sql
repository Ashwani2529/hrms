/*
  Warnings:

  - The primary key for the `User_shift` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "User_shift" DROP CONSTRAINT "User_shift_pkey",
ADD CONSTRAINT "User_shift_pkey" PRIMARY KEY ("user_id", "shift_id");
