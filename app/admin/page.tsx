// app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const patients = await prisma.patient.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, phone: true },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mini-EMR Admin</h1>
      <h2 className="text-lg font-semibold">Patients in the system</h2>

      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">ID</th>
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">Email</th>
            <th className="text-left p-2 border">Phone</th>
            <th className="text-left p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 border">{p.id}</td>
              <td className="p-2 border">{p.name || "(no name)"}</td>
              <td className="p-2 border">{p.email}</td>
              <td className="p-2 border">{p.phone ?? "—"}</td>

              {/* ⬇ Replace your old Actions cell with this */}
              <td className="p-2 border">
  <div className="flex gap-3">
    <Link className="underline" href={`/admin/patients/${p.id}`}>View</Link>
    <Link className="underline" href={`/portal/${p.id}`}>Portal</Link> {/* ← updated */}
  </div>
</td>

              {/* ⬆ */}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-sm">
        Also see: <Link className="underline" href="/admin/meds">Medication Catalog</Link>
      </p>
    </main>
  );
}
