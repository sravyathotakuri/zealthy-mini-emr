/*
  Warnings:

  - A unique constraint covering the columns `[patientId,date]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patientId,medication,dosage]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_patientId_date_key" ON "Appointment"("patientId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_patientId_medication_dosage_key" ON "Prescription"("patientId", "medication", "dosage");
