-- DropForeignKey
ALTER TABLE "User_holiday" DROP CONSTRAINT "User_holiday_user_id_fkey";

-- AddForeignKey
ALTER TABLE "User_holiday" ADD CONSTRAINT "User_holiday_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
