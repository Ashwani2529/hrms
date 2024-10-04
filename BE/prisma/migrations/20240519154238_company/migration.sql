-- CreateTable
CREATE TABLE "CompanyTemplate" (
    "template_id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_content" TEXT NOT NULL,
    "template_variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyTemplate_pkey" PRIMARY KEY ("template_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyTemplate_template_id_key" ON "CompanyTemplate"("template_id");
