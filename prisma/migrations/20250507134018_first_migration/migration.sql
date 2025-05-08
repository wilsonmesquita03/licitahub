-- CreateEnum
CREATE TYPE "CostType" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MATERIAL', 'SERVICO', 'TRANSPORTE', 'TRIBUTOS', 'OUTROS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "purchaseNumber" TEXT NOT NULL,
    "process" TEXT NOT NULL,
    "purchaseYear" INTEGER NOT NULL,
    "purchaseSequence" INTEGER NOT NULL,
    "modalityId" INTEGER NOT NULL,
    "modalityName" TEXT NOT NULL,
    "instrumentTypeName" TEXT NOT NULL,
    "purchaseStatusId" INTEGER NOT NULL,
    "purchaseStatusName" TEXT NOT NULL,
    "purchaseObject" TEXT NOT NULL,
    "estimatedTotalValue" INTEGER NOT NULL,
    "approvedTotalValue" INTEGER,
    "inclusionDate" TIMESTAMP(3) NOT NULL,
    "publicationDatePncp" TIMESTAMP(3) NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "proposalOpeningDate" TIMESTAMP(3) NOT NULL,
    "proposalClosingDate" TIMESTAMP(3) NOT NULL,
    "pncpControlNumber" TEXT NOT NULL,
    "globalUpdateDate" TIMESTAMP(3) NOT NULL,
    "disputeModeId" INTEGER NOT NULL,
    "disputeModeName" TEXT NOT NULL,
    "srp" BOOLEAN NOT NULL,
    "userName" TEXT,
    "orgaoEntidadeId" TEXT NOT NULL,
    "unidadeOrgaoId" TEXT NOT NULL,
    "amparoLegalId" TEXT NOT NULL,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgaoEntidade" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "powerId" TEXT NOT NULL,
    "sphereId" TEXT NOT NULL,

    CONSTRAINT "OrgaoEntidade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeOrgao" (
    "id" TEXT NOT NULL,
    "unitCode" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "stateAbbr" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "ibgeCode" TEXT NOT NULL,

    CONSTRAINT "UnidadeOrgao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmparoLegal" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "AmparoLegal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "type" "CostType" NOT NULL,
    "tenderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_pncpControlNumber_key" ON "Tender"("pncpControlNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrgaoEntidade_cnpj_key" ON "OrgaoEntidade"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeOrgao_unitCode_key" ON "UnidadeOrgao"("unitCode");

-- CreateIndex
CREATE UNIQUE INDEX "AmparoLegal_code_key" ON "AmparoLegal"("code");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_orgaoEntidadeId_fkey" FOREIGN KEY ("orgaoEntidadeId") REFERENCES "OrgaoEntidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_unidadeOrgaoId_fkey" FOREIGN KEY ("unidadeOrgaoId") REFERENCES "UnidadeOrgao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_amparoLegalId_fkey" FOREIGN KEY ("amparoLegalId") REFERENCES "AmparoLegal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostItem" ADD CONSTRAINT "CostItem_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "Tender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostItem" ADD CONSTRAINT "CostItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
