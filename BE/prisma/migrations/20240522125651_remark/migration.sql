/*
  Warnings:

  - The values [POSTIVE,NEGATIVE] on the enum `REMARK_TYPE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "REMARK_TYPE_new" AS ENUM ('PERFORMANCE', 'CONFLICT');
ALTER TABLE "Remark" ALTER COLUMN "remark_type" TYPE "REMARK_TYPE_new" USING ("remark_type"::text::"REMARK_TYPE_new");
ALTER TYPE "REMARK_TYPE" RENAME TO "REMARK_TYPE_old";
ALTER TYPE "REMARK_TYPE_new" RENAME TO "REMARK_TYPE";
DROP TYPE "REMARK_TYPE_old";
COMMIT;
