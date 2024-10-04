-- AlterTable
ALTER TABLE "User" ALTER COLUMN "user_name" DROP NOT NULL,
ALTER COLUMN "date_of_joining" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Inactive';
