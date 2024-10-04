-- AlterTable
ALTER TABLE "CompanyTemplate" ADD COLUMN     "template_content_html" TEXT,
ALTER COLUMN "template_content" DROP NOT NULL;
