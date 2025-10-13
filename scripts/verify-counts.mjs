// scripts/verify-counts.mjs
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

try {
  const [patients, appts, rx, meds] = await Promise.all([
    p.patient.count(),
    p.appointment.count(),
    p.prescription.count(),
    p.medicationCatalog.count(),
  ]);
  console.log({ patients, appts, rx, meds });
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await p.$disconnect();
}
