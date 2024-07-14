/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `GuestBook` table. All the data in the column will be lost.
  - You are about to drop the column `avatarImageUrl` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `homeImageUrl` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imageKey]` on the table `GuestBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[avatarImageKey]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[homeImageKey]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GuestBook" DROP COLUMN "imageUrl",
ADD COLUMN     "imageKey" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "avatarImageUrl",
DROP COLUMN "homeImageUrl",
ADD COLUMN     "avatarImageKey" TEXT,
ADD COLUMN     "homeImageKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GuestBook_imageKey_key" ON "GuestBook"("imageKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_avatarImageKey_key" ON "UserProfile"("avatarImageKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_homeImageKey_key" ON "UserProfile"("homeImageKey");
