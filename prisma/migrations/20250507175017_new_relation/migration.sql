/*
  Warnings:

  - Added the required column `updatedAt` to the `Tender` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_FollowedTenders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FollowedTenders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FollowedTenders_B_index" ON "_FollowedTenders"("B");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FollowedTenders" ADD CONSTRAINT "_FollowedTenders_A_fkey" FOREIGN KEY ("A") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FollowedTenders" ADD CONSTRAINT "_FollowedTenders_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
