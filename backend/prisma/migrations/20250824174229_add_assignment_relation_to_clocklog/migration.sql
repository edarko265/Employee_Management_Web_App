-- AlterTable
ALTER TABLE "public"."ClockLog" ADD COLUMN     "assignmentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."ClockLog" ADD CONSTRAINT "ClockLog_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
