/*
  Warnings:

  - You are about to drop the column `homeLogName` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `guestBookName` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "homeLogName",
ADD COLUMN     "guestBookName" TEXT NOT NULL;
