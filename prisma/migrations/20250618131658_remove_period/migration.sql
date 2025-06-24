/*
  Warnings:

  - You are about to drop the column `period` on the `SentBoletim` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,rangeStart]` on the table `SentBoletim` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SentBoletim_userId_period_rangeStart_key";

-- AlterTable
ALTER TABLE "SentBoletim" DROP COLUMN "period";

-- CreateIndex
CREATE UNIQUE INDEX "SentBoletim_userId_rangeStart_key" ON "SentBoletim"("userId", "rangeStart");
