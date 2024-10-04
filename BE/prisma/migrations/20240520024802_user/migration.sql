-- CreateEnum
CREATE TYPE "DOCS_STATUS_TYPE" AS ENUM ('PENDING', 'SIGNED', 'APPROVED');

-- CreateTable
CREATE TABLE "userDocs" (
    "usrdoc_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "usrdoc_title" TEXT NOT NULL,
    "usrdoc_description" TEXT,
    "usrdoc_variables_data" TEXT[],
    "usrdoc_pdf_url" TEXT,
    "usrdoc_status" "DOCS_STATUS_TYPE" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userDocs_pkey" PRIMARY KEY ("usrdoc_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userDocs_usrdoc_id_key" ON "userDocs"("usrdoc_id");

-- AddForeignKey
ALTER TABLE "userDocs" ADD CONSTRAINT "userDocs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userDocs" ADD CONSTRAINT "userDocs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "CompanyTemplate"("template_id") ON DELETE CASCADE ON UPDATE CASCADE;
