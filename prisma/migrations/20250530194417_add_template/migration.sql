/*
  Warnings:

  - Added the required column `template` to the `ProposalTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProposalTemplate" ADD COLUMN     "template" JSONB NOT NULL;
