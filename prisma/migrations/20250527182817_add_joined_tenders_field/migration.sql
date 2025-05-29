-- AlterTable
ALTER TABLE "Tender" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "_JoinedTenders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JoinedTenders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_JoinedTenders_B_index" ON "_JoinedTenders"("B");

-- AddForeignKey
ALTER TABLE "Tender" ADD CONSTRAINT "Tender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoinedTenders" ADD CONSTRAINT "_JoinedTenders_A_fkey" FOREIGN KEY ("A") REFERENCES "Tender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoinedTenders" ADD CONSTRAINT "_JoinedTenders_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
