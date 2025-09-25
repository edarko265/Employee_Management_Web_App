/*
  Warnings:

  - You are about to drop the column `locationName` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_locationName_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationName",
ADD COLUMN     "locationId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
