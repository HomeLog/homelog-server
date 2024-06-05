-- AlterTable
ALTER TABLE "GuestBook" ADD COLUMN     "visitorName" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
