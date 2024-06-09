/*
  Warnings:

  - Added the required column `homeLogName` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "homeLogName" TEXT NOT NULL;
