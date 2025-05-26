/*
  Warnings:

  - A unique constraint covering the columns `[codigoModalidadeContratacao,dataInicial,dataFinal,endpoint]` on the table `PncpSyncProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PncpSyncProgress_codigoModalidadeContratacao_dataInicial_da_key";

-- CreateIndex
CREATE UNIQUE INDEX "PncpSyncProgress_codigoModalidadeContratacao_dataInicial_da_key" ON "PncpSyncProgress"("codigoModalidadeContratacao", "dataInicial", "dataFinal", "endpoint");
