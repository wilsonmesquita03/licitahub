/*
  Warnings:

  - The `keyword` column on the `UserKeyword` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserKeyword" ADD COLUMN     "default" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "keyword",
ADD COLUMN     "keyword" TEXT[];

-- CreateIndex
CREATE INDEX "UserKeyword_keyword_idx" ON "UserKeyword"("keyword");
