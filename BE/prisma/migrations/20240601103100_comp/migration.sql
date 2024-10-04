-- CreateTable
CREATE TABLE "Complementary_Leave" (
    "comp_leave_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "no_of_leaves" INTEGER NOT NULL,
    "standarised_hours" INTEGER NOT NULL,
    "salary_slip_id" TEXT NOT NULL,
    "expired_At" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complementary_Leave_pkey" PRIMARY KEY ("comp_leave_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Complementary_Leave_comp_leave_id_key" ON "Complementary_Leave"("comp_leave_id");

-- AddForeignKey
ALTER TABLE "Complementary_Leave" ADD CONSTRAINT "Complementary_Leave_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complementary_Leave" ADD CONSTRAINT "Complementary_Leave_salary_slip_id_fkey" FOREIGN KEY ("salary_slip_id") REFERENCES "SalarySlip"("salary_slip_id") ON DELETE CASCADE ON UPDATE CASCADE;
