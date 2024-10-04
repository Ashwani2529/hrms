-- CreateEnum
CREATE TYPE "TICKET_TYPE" AS ENUM ('COMPLAINT');

-- CreateTable
CREATE TABLE "Tickets" (
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "request_date" TIMESTAMP(3),
    "ticket_title" TEXT,
    "ticket_description" TEXT,
    "ticket_type" "TICKET_TYPE" NOT NULL,
    "ticket_status" "LEAVE_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tickets_ticket_id_key" ON "Tickets"("ticket_id");

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
