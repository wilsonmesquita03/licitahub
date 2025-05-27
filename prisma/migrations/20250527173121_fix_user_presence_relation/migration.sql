/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserPreferences` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
