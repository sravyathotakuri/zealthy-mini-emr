// app/admin/patients/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  updatePatientAction,
  createAppointmentAction,
  updateAppointmentAction,
  deleteAppointmentAction,
  createPrescriptionAction,
  updatePrescriptionAction,
  deletePrescriptionAction,
} from "./actions";


export const dynamic = "force-dynamic";

export default async function PatientDetail({
  params,
}: {
  // ✅ Next 15 strict typing: params is a Promise
  params: Promise<{ id: string }>;
}) {
  // ✅ unwrap the Promise and parse to number
  const { id } = await params;
  const idNum = Number(id);

  if (Number.isNaN(idNum)) {
    return (
      <main className="p-6">
        <p className="text-red-600">Invalid patient id.</p>
        <p className="mt-4">
          <Link className="underline" href="/admin">← Back to Admin</Link>
        </p>
      </main>
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: idNum }, // ✅ use idNum
    select: { id: true, name: true, email: true, phone: true },
  });
  if (!patient) {
    return (
      <main className="p-6">
        <p className="text-red-600">Patient not found.</p>
        <p className="mt-4">
          <Link className="underline" href="/admin">← Back to Admin</Link>
        </p>
      </main>
    );
  }

  const [appointments, prescriptions, medCatalog] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: idNum }, // ✅ use idNum
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        reason: true,
        provider: true,
        repeatSchedule: true,
        repeatUntil: true,
      },
    }),
    prisma.prescription.findMany({
      where: { patientId: idNum }, // ✅ use idNum
      orderBy: [{ medication: "asc" }, { dosage: "asc" }],
      select: {
        id: true,
        medication: true,
        dosage: true,
        quantity: true,
        refillDate: true,
        refillSchedule: true,
      },
    }),
    prisma.medicationCatalog.findMany({
      orderBy: [{ medicationName: "asc" }, { dosage: "asc" }],
      select: { medicationName: true, dosage: true },
    }),
  ]);

  const medNames = Array.from(new Set(medCatalog.map(m => m.medicationName))).sort();
  const doseValues = Array.from(new Set(medCatalog.map(m => m.dosage))).sort();

  return (
    <main className="p-6 space-y-8">
      <p className="text-sm">
        <Link className="underline" href="/admin">← Back to Admin</Link>
      </p>

      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">{patient.name}</h1>
        <p className="text-sm text-gray-600">
          {patient.email}{patient.phone ? ` • ${patient.phone}` : ""}
        </p>
        <p className="text-sm">
          <Link href={`/portal/${patient.id}`} className="underline">
            Open in Portal
          </Link>
        </p>

        <form action={updatePatientAction} className="space-y-2 border p-3 rounded max-w-xl">
          <input type="hidden" name="id" value={patient.id} />
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input className="border p-2 rounded w-full" name="name" defaultValue={patient.name} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input className="border p-2 rounded w-full" name="phone" defaultValue={patient.phone ?? ""} />
          </div>
          <button className="border px-3 py-1 rounded" type="submit">Save</button>
        </form>
      </header>

      {/* Appointments */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Appointments</h2>

        {appointments.length === 0 ? (
          <p className="text-sm text-gray-600">No appointments.</p>
        ) : (
          <ul className="space-y-2">
            {appointments.map(a => (
              <li key={a.id} className="border p-3 rounded">
                <div className="text-sm mb-2">
                  {new Date(a.date).toLocaleString()} — {a.reason ?? "No reason"}
                  {a.provider ? ` • ${a.provider}` : ""}
                  {a.repeatSchedule ? ` • repeats: ${a.repeatSchedule}${a.repeatUntil ? ` until ${new Date(a.repeatUntil).toLocaleDateString()}` : ""}` : ""}
                </div>


                {/* Update appointment */}
                <form action={updateAppointmentAction} className="grid md:grid-cols-4 gap-3 items-end">
                  <input type="hidden" name="id" value={a.id} />

                  <div>
                    <label className="block text-xs font-medium">Date/Time</label>
                    <input
                      className="border p-2 rounded w-full"
                      type="datetime-local"
                      name="date"
                      defaultValue={new Date(a.date).toISOString().slice(0, 16)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Provider</label>
                    <input
                      className="border p-2 rounded w-full"
                      name="provider"
                      defaultValue={a.provider ?? ""}
                      placeholder="Dr. Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Repeat</label>
                    <select
                      className="border p-2 rounded w-full"
                      name="repeatSchedule"
                      defaultValue={a.repeatSchedule ?? ""}
                    >
                      <option value="">None</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Repeat until</label>
                    <input
                      className="border p-2 rounded w-full"
                      type="date"
                      name="repeatUntil"
                      defaultValue={a.repeatUntil ? new Date(a.repeatUntil).toISOString().slice(0, 10) : ""}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium">Reason</label>
                    <input
                      className="border p-2 rounded w-full"
                      name="reason"
                      defaultValue={a.reason ?? ""}
                      placeholder="General Checkup"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button className="border px-3 py-1 rounded" type="submit">Update</button>
                  </div>
                </form>

                <form action={deleteAppointmentAction} className="mt-2">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="border px-3 py-1 rounded" type="submit">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* Create */}
        <form action={createAppointmentAction} className="space-y-3 border p-3 rounded">
          <input type="hidden" name="patientId" value={idNum} /> {/* ✅ use idNum here */}

          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium">Date/Time</label>
              <input className="border p-2 rounded w-full" name="date" type="datetime-local" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Provider</label>
              <input className="border p-2 rounded w-full" name="provider" placeholder="Dr. Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium">Repeat</label>
              <select className="border p-2 rounded w-full" name="repeatSchedule" defaultValue="">
                <option value="">None</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Repeat until</label>
              <input className="border p-2 rounded w-full" type="date" name="repeatUntil" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Reason</label>
            <input className="border p-2 rounded w-full" name="reason" placeholder="General Checkup" />
          </div>

          <button className="border px-3 py-1 rounded" type="submit">Create Appointment</button>
        </form>
      </section>

      {/* Prescriptions */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Prescriptions</h2>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-gray-600">No prescriptions.</p>
        ) : (
          <ul className="space-y-2">
            {prescriptions.map(r => (
              <li key={r.id} className="border p-3 rounded">
                <div className="text-sm mb-2">
                  {r.medication} {r.dosage}
                  {r.quantity ? ` • Qty: ${r.quantity}` : ""}
                  {r.refillDate ? ` • Refill: ${new Date(r.refillDate).toLocaleDateString()}` : ""}
                  {r.refillSchedule ? ` • ${r.refillSchedule}` : ""}
                </div>

                <form action={updatePrescriptionAction} className="grid md:grid-cols-5 gap-3 items-end">
                  <input type="hidden" name="id" value={r.id} />

                  <div>
                    <label className="block text-xs font-medium">Medication</label>
                    <select className="border p-2 rounded w-full" name="medication" defaultValue={r.medication}>
                      {medNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Dosage</label>
                    <select className="border p-2 rounded w-full" name="dosage" defaultValue={r.dosage ?? ""}>
                      {doseValues.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Quantity</label>
                    <input className="border p-2 rounded w-full" type="number" name="quantity" defaultValue={r.quantity ?? ""} min={0} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Refill date</label>
                    <input className="border p-2 rounded w-full" type="date" name="refillDate"
                      defaultValue={r.refillDate ? new Date(r.refillDate).toISOString().slice(0,10) : ""} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium">Refill schedule</label>
                    <select className="border p-2 rounded w-full" name="refillSchedule" defaultValue={r.refillSchedule ?? ""}>
                      <option value="">None</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  
                  <button className="border px-3 py-1 rounded" type="submit">Update</button>
                </form>

                <form action={deletePrescriptionAction} className="mt-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button className="border px-3 py-1 rounded" type="submit">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* Create Rx */}
        <form action={createPrescriptionAction} className="space-y-3 border p-3 rounded">
          <input type="hidden" name="patientId" value={idNum} /> {/* ✅ use idNum here */}
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Medication</label>
              <select className="border p-2 rounded w-full" name="medication" required>
                {medNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Dosage</label>
              <select className="border p-2 rounded w-full" name="dosage" required>
                {doseValues.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Quantity</label>
              <input className="border p-2 rounded w-full" type="number" name="quantity" min={0} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Refill date</label>
              <input className="border p-2 rounded w-full" type="date" name="refillDate" />
            </div>
            <div>
              <label className="block text-sm font-medium">Refill schedule</label>
              <select className="border p-2 rounded w-full" name="refillSchedule" defaultValue="">
                <option value="">None</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <button className="border px-3 py-1 rounded" type="submit">Create Prescription</button>
        </form>
      </section>
    </main>
  );
}
