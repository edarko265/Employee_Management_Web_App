-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "workplaceId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_workplaceId_fkey" FOREIGN KEY ("workplaceId") REFERENCES "public"."Workplace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
