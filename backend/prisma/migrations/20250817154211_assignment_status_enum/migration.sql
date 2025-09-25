/*
  Warnings:

  - Changed the type of `status` on the `Assignment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Update existing values to match enum (if needed)
UPDATE "Assignment" SET "status" = 'UPCOMING' WHERE "status" = 'upcoming';
UPDATE "Assignment" SET "status" = 'IN_PROGRESS' WHERE "status" = 'in-progress';
UPDATE "Assignment" SET "status" = 'COMPLETED' WHERE "status" = 'completed';
UPDATE "Assignment" SET "status" = 'CANCELLED' WHERE "status" = 'cancelled';
UPDATE "Assignment" SET "status" = 'IN_PROGRESS' WHERE "status" = 'active'; -- <--- Add this line

-- AlterTable
ALTER TABLE "Assignment"
  ALTER COLUMN "status" TYPE "AssignmentStatus" USING "status"::"AssignmentStatus";
