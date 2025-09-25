/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startTime" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Schedule";
