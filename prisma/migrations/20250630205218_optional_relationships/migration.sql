-- DropForeignKey
ALTER TABLE "Tender" DROP CONSTRAINT "Tender_amparoLegalId_fkey";

-- DropForeignKey
ALTER TABLE "Tender" DROP CONSTRAINT "Tender_orgaoEntidadeId_fkey";

-- DropForeignKey
ALTER TABLE "Tender" DROP CONSTRAINT "Tender_unidadeOrgaoId_fkey";

-- AlterTable
ALTER TABLE "Tender" ALTER COLUMN "orgaoEntidadeId" DROP NOT NULL,
ALTER COLUMN "unidadeOrgaoId" DROP NOT NULL,
ALTER COLUMN "amparoLegalId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_orgaoEntidadeId_fkey" FOREIGN KEY ("orgaoEntidadeId") REFERENCES "OrgaoEntidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_unidadeOrgaoId_fkey" FOREIGN KEY ("unidadeOrgaoId") REFERENCES "UnidadeOrgao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_amparoLegalId_fkey" FOREIGN KEY ("amparoLegalId") REFERENCES "AmparoLegal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
