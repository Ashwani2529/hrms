/*
  Warnings:

  - You are about to drop the column `salary_from_date` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the column `salary_to_date` on the `Salary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "salary_from_date",
DROP COLUMN "salary_to_date",
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "from_date" TIMESTAMP(3);
