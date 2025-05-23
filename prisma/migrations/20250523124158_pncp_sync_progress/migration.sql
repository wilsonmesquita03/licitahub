-- CreateTable
CREATE TABLE "PncpSyncProgress" (
    "id" SERIAL NOT NULL,
    "codigoModalidadeContratacao" INTEGER NOT NULL,
    "dataInicial" TIMESTAMP(3) NOT NULL,
    "dataFinal" TIMESTAMP(3) NOT NULL,
    "ultimaPaginaSincronizada" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PncpSyncProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PncpSyncProgress_codigoModalidadeContratacao_dataInicial_da_key" ON "PncpSyncProgress"("codigoModalidadeContratacao", "dataInicial", "dataFinal");
