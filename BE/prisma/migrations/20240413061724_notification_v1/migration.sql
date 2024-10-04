-- CreateEnum
CREATE TYPE "NOTIFICATION_TYPE" AS ENUM ('Shift', 'Leave', 'Attendance');

-- CreateEnum
CREATE TYPE "NOTIFICATION_STATUS" AS ENUM ('Pending', 'Read');

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification" TEXT NOT NULL,
    "notification_type" "NOTIFICATION_TYPE" NOT NULL,
    "notification_status" "NOTIFICATION_STATUS" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_notification_id_key" ON "Notification"("notification_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
