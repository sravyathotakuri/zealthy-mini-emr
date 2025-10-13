// app/portal/[id]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PatientPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return (
      <main className="p-6 space-y-2">
        <h1 className="text-2xl font-semibold">Patient Portal</h1>
        <p className="text-red-600">Invalid patient id.</p>
        <p className="text-sm"><Link href="/portal" className="underline">← Back to Portal</Link></p>
      </main>
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      // ALL future appointments
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        select: { id: true, date: true, reason: true, provider: true, repeatSchedule: true, repeatUntil: true },
      },
      // ALL prescriptions
      prescriptions: {
        orderBy: [{ medication: "asc" }, { dosage: "asc" }],
        select: { id: true, medication: true, dosage: true, quantity: true, refillDate: true, refillSchedule: true },
      },
    },
  });

  if (!patient) {
    return (
      <main className="p-6 space-y-2">
        <h1 className="text-2xl font-semibold">Patient Portal</h1>
        <p className="text-red-600">Patient not found.</p>
        <p className="text-sm"><Link href="/portal" className="underline">← Back to Portal</Link></p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Patient Portal</h1>
      <p className="text-sm text-gray-600">
        Welcome, {patient.name} ({patient.email})
      </p>
      <p className="text-sm">
        <Link href="/portal" className="underline">← Back to Portal</Link>{" "}
        • <Link href="/admin" className="underline">Manage in Admin</Link>
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">All Upcoming Appointments</h2>
        {patient.appointments.length === 0 ? (
          <p className="text-gray-600 text-sm">No upcoming appointments.</p>
        ) : (
          <ul className="space-y-2">
            {patient.appointments.map((a) => (
              <li key={a.id} className="border rounded p-2">
                {new Date(a.date).toLocaleString()} — {a.reason ?? "No reason"}
                {a.provider ? ` • ${a.provider}` : ""}
                {a.repeatSchedule
                  ? ` • repeats: ${a.repeatSchedule}${
                      a.repeatUntil ? ` until ${new Date(a.repeatUntil).toLocaleDateString()}` : ""
                    }`
                  : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">All Prescriptions</h2>
        {patient.prescriptions.length === 0 ? (
          <p className="text-gray-600 text-sm">No prescriptions on file.</p>
        ) : (
          <ul className="space-y-2">
            {patient.prescriptions.map((r) => (
              <li key={r.id} className="border rounded p-2">
                {r.medication} — {r.dosage}
                {typeof r.quantity === "number" ? ` • Qty: ${r.quantity}` : ""}
                {r.refillDate ? ` • Refill: ${new Date(r.refillDate).toLocaleDateString()}` : ""}
                {r.refillSchedule ? ` • ${r.refillSchedule}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
