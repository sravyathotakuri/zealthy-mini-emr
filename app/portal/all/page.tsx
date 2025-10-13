// app/portal/all/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PortalAllPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 3,
        select: { id: true, date: true, reason: true, provider: true },
      },
      prescriptions: {
        orderBy: [{ medication: "asc" }, { dosage: "asc" }],
        take: 5,
        select: { id: true, medication: true, dosage: true },
      },
    },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Patient Portal</h1>
      <p className="text-sm text-gray-600">
        Pick a patient to view details, or browse everyone below.
      </p>
      <p className="text-sm">
        <Link href="/admin" className="underline">Manage in Admin</Link>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {patients.map((p) => (
          <section key={p.id} className="border rounded p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <Link href={`/portal?id=${p.id}`} className="underline text-sm">Open</Link>
            </div>
            <p className="text-sm text-gray-600">{p.email}</p>

            <div>
              <h3 className="font-medium">Upcoming Appointments</h3>
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
              <h3 className="font-medium">Current Prescriptions</h3>
              {p.prescriptions.length === 0 ? (
                <p className="text-sm text-gray-600">No prescriptions on file.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {p.prescriptions.map((r) => (
                    <li key={r.id} className="border rounded p-2 text-sm">
                      {r.medication} — {r.dosage}
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
