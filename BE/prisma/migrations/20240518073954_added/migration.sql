-- CreateEnum
CREATE TYPE "REMARK_TYPE" AS ENUM ('PERFORMANCE', 'CONFLICT');

-- CreateTable
CREATE TABLE "Remark" (
    "remark_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "remark_date" TIMESTAMP(3),
    "remark_title" TEXT NOT NULL,
    "remark_description" TEXT NOT NULL,
    "remark_level" INTEGER NOT NULL,
    "remark_type" "REMARK_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remark_pkey" PRIMARY KEY ("remark_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Remark_remark_id_key" ON "Remark"("remark_id");

-- AddForeignKey
ALTER TABLE "Remark" ADD CONSTRAINT "Remark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
