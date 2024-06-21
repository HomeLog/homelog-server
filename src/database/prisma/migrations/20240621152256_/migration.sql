/*
  Warnings:

  - You are about to drop the column `profileImageUrl` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "profileImageUrl",
ADD COLUMN     "avatarImageUrl" TEXT;
