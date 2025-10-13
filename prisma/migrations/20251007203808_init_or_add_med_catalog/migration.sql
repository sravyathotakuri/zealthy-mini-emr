-- CreateTable
CREATE TABLE "MedicationCatalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicationName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicationCatalog_medicationName_dosage_key" ON "MedicationCatalog"("medicationName", "dosage");
