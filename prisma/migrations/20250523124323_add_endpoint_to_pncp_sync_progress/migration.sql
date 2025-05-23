/*
  Warnings:

  - Added the required column `endpoint` to the `PncpSyncProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PncpSyncProgress" ADD COLUMN     "endpoint" TEXT NOT NULL;
