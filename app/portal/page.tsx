// app/portal/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function in7Days() {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { now, end };
}

export default async function PortalDirectoryPage() {
  const { now, end } = in7Days();

  const patients = await prisma.patient.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      // Appointments happening in the next 7 days
      appointments: {
        where: { date: { gte: now, lte: end } },
        orderBy: { date: "asc" },
        select: { id: true, date: true, reason: true, provider: true },
      },
      // Prescriptions with a refill in the next 7 days
      prescriptions: {
        where: { refillDate: { not: null, gte: now, lte: end } },
        orderBy: { refillDate: "asc" },
        select: { id: true, medication: true, dosage: true, refillDate: true, refillSchedule: true },
      },
    },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Patient Portal</h1>
      <p className="text-sm text-gray-600">
        This page shows the most important info for the next 7 days. Open a patient to see everything.
      </p>
      <p className="text-sm">
        <Link href="/admin" className="underline">Manage in Admin</Link>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {patients.map((p) => (
          <section key={p.id} className="border rounded p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <Link href={`/portal/${p.id}`} className="underline text-sm">Open</Link>
            </div>

            <p className="text-sm text-gray-600">{p.email}</p>

            <div>
              <h3 className="font-medium">Appointments (next 7 days)</h3>
              {p.appointments.length === 0 ? (
                <p className="text-sm text-gray-600">None scheduled.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {p.appointments.map((a) => (
                    <li key={a.id} className="border rounded p-2 text-sm">
                      {new Date(a.date).toLocaleString()} — {a.reason ?? "No reason"}
                      {a.provider ? ` • ${a.provider}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-medium">Upcoming Refills (next 7 days)</h3>
              {p.prescriptions.length === 0 ? (
                <p className="text-sm text-gray-600">No refills due.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {p.prescriptions.map((r) => (
                    <li key={r.id} className="border rounded p-2 text-sm">
                      {r.medication} — {r.dosage}
                      {r.refillDate ? ` • Refill on ${new Date(r.refillDate).toLocaleDateString()}` : ""}
                      {r.refillSchedule ? ` • ${r.refillSchedule}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
