// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// If you run with `npx prisma db seed`, Prisma will execute this file with tsx/ts-node.
// No need to import fs/path unless you want local fallback.

const prisma = new PrismaClient();

// Flexible helpers for the gist format
function toArray(x: unknown): string[] {
  if (x == null) return [];
  if (Array.isArray(x)) return x.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof x === "string") return x.split(/[;,|]/).map(s => s.trim()).filter(Boolean);
  return [String(x)].map(s => s.trim()).filter(Boolean);
}

async function loadGistMedications(): Promise<
  Array<{ medicationName: string; dosages: string[] }>
> {
  const url =
    "https://gist.githubusercontent.com/sbraford/73f63d75bb995b6597754c1707e40cc2/raw/data.json";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Seed JSON fetch failed ${res.status} ${res.statusText}`);
    const data: any = await res.json();

    const medNamesRaw = data.medications ?? data.Medications ?? data.meds ?? data.MEDS ?? [];
    const medNames: string[] = toArray(medNamesRaw);

    const dosageSource = data.dosages ?? data.Dosages ?? data.DOSAGES ?? null;

    let medEntries: { medicationName: string; dosages: string[] }[] = [];

    if (medNames.length) {
      if (dosageSource && typeof dosageSource === "object" && !Array.isArray(dosageSource)) {
        // Map per-med: { "Diovan": ["10mg","20mg"], ... }
        medEntries = medNames.map((name) => ({
          medicationName: String(name),
          dosages: toArray((dosageSource as Record<string, unknown>)[String(name)]),
        }));
      } else if (Array.isArray(dosageSource) || typeof dosageSource === "string") {
        // Common list for all meds
        const common = toArray(dosageSource);
        medEntries = medNames.map((name) => ({
          medicationName: String(name),
          dosages: common,
        }));
      } else {
        // No dosages provided
        medEntries = medNames.map((name) => ({ medicationName: String(name), dosages: [] }));
      }
    }

    return medEntries;
  } catch (e) {
    console.warn("Failed to fetch gist data; using a tiny fallback set.", e);
    return [
      { medicationName: "Atorvastatin", dosages: ["10mg"] },
      { medicationName: "Lisinopril", dosages: ["20mg"] },
    ];
  }
}

async function main() {
  console.log("DATABASE_URL =", process.env.DATABASE_URL);

  // ---- 1) MedicationCatalog (DENORMALIZED) ----
  // Expects your schema to have:
  // model MedicationCatalog {
  //   id             Int    @id @default(autoincrement())
  //   medicationName String
  //   dosage         String
  //   @@unique([medicationName, dosage], name: "medicationName_dosage")
  // }
  const medEntries = await loadGistMedications();
  let medCount = 0;
  for (const m of medEntries) {
    const doses = toArray(m.dosages);
    if (!doses.length) {
      console.warn("Skipping med with no doses:", m.medicationName);
      continue;
    }
    for (const d of doses) {
      await prisma.medicationCatalog.upsert({
        where: { medicationName_dosage: { medicationName: m.medicationName, dosage: d } },
        update: {}, // nothing to update for now
        create: { medicationName: m.medicationName, dosage: d },
      });
      medCount++;
    }
  }
  console.log("Upserted MedicationCatalog rows:", medCount);

  // ---- 2) Patient(s) (uses 'name', not 'fullName') ----
  // Expects:
  // model Patient {
  //   id           Int    @id @default(autoincrement())
  //   email        String @unique
  //   name         String
  //   phone        String?
  //   passwordHash String?
  //   // ...
  // }
  // ---- 2) Patient(s) (uses 'name', not 'fullName') ----
const patients = [
  { email: "alice@example.com", name: "Alice Carter", phone: "555-000-0001", plain: "alicepass" },
  { email: "bob@example.com",   name: "Bob Nguyen",   phone: "555-000-0002", plain: "bobpass" },
  { email: "jane@example.com",  name: "Jane Doe",     phone: "555-123-4567", plain: "janepass" },
];

console.log("Upserting patients:", patients.map(p => p.email));

await prisma.$transaction(async (tx) => {
  for (const p of patients) {
    const passwordHash = await bcrypt.hash(p.plain, 10);
    const row = await tx.patient.upsert({
      where:  { email: p.email },
      update: { name: p.name, phone: p.phone, passwordHash },
      create: { email: p.email, name: p.name, phone: p.phone, passwordHash },
      select: { id: true, email: true, name: true },
    });
    console.log("Upserted patient:", row);
  }
});

const jane = await prisma.patient.findUnique({ where: { email: "jane@example.com" } });
if (!jane) throw new Error("Jane patient not created");

  // ---- 3) Appointment (uses 'date', not startsAt/endsAt) ----
  // Expects:
  // model Appointment {
  //   id        Int      @id @default(autoincrement())
  //   patientId Int
  //   date      DateTime
  //   reason    String?
  //   status    String? @default("scheduled")
  //   patient   Patient @relation(fields: [patientId], references: [id])
  // }
  // ---- 3) Appointment (uses 'date', no 'status' field) ----
const apptDateISO = "2025-10-10T10:00:00.000Z";

// Idempotent without DB unique: delete then create
await prisma.appointment.deleteMany({
  where: { patientId: jane.id, date: new Date(apptDateISO) },
});

await prisma.appointment.create({
  data: {
    date: new Date(apptDateISO),
    reason: "General Checkup",
    // status: "scheduled", // ← REMOVE THIS (your model doesn't have it)
    patient: { connect: { id: jane.id } },
  },
});


  // ---- 4) Prescription (uses strings 'medication' + 'dosage', not medicationId) ----
  // Expects:
  // model Prescription {
  //   id        Int    @id @default(autoincrement())
  //   patientId Int
  //   medication String
  //   dosage     String
  //   patient   Patient @relation(fields: [patientId], references: [id])
  // }
  const rxMed = "Atorvastatin";
  const rxDose = "10mg";

  const existingRx = await prisma.prescription.findFirst({
    where: { patientId: jane.id, medication: rxMed, dosage: rxDose },
  });
  if (!existingRx) {
    await prisma.prescription.create({
      data: {
        patientId: jane.id,
        medication: rxMed,
        dosage: rxDose,
      },
    });
  }

  // ---- Final counts ----
  const counts = {
    patients: await prisma.patient.count(),
    appts: await prisma.appointment.count(),
    rx: await prisma.prescription.count(),
    meds: await prisma.medicationCatalog.count(),
  };
  console.log("Final counts:", counts);
}

main()
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
