-- CreateEnum
CREATE TYPE "EVENT_LOG_TYPE" AS ENUM ('Create', 'Read', 'Update', 'Delete');

-- CreateTable
CREATE TABLE "Logger" (
    "logger_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "log_type" "EVENT_LOG_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Logger_pkey" PRIMARY KEY ("logger_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Logger_logger_id_key" ON "Logger"("logger_id");

-- AddForeignKey
ALTER TABLE "Logger" ADD CONSTRAINT "Logger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
