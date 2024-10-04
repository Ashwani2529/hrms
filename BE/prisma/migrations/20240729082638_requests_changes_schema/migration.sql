-- CreateEnum
CREATE TYPE "REQUEST_TYPE" AS ENUM ('ATTENDANCE_CORRECTION', 'COMPLAINT');

-- CreateTable
CREATE TABLE "Requests" (
    "request_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_date" TIMESTAMP(3),
    "request_title" TEXT,
    "request_description" TEXT,
    "request_type" "REQUEST_TYPE" NOT NULL,
    "request_status" "LEAVE_STATUS" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Requests_request_id_key" ON "Requests"("request_id");

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
