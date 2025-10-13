-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "provider" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "repeatSchedule" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "repeatUntil" DATETIME;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "Prescription" ADD COLUMN "refillDate" DATETIME;
ALTER TABLE "Prescription" ADD COLUMN "refillSchedule" TEXT;
