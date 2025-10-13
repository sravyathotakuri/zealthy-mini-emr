// app/admin/meds/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MedsPage() {
  const meds = await prisma.medicationCatalog.findMany({
    orderBy: [{ medicationName: "asc" }, { dosage: "asc" }],
    select: { id: true, medicationName: true, dosage: true },
  });

  return (
    <main className="p-6 space-y-4">
      <p className="text-sm">
        <Link className="underline" href="/admin">← Back to Admin</Link>
      </p>
      <h1 className="text-2xl font-semibold">Medication Catalog</h1>

      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Name</th>
            <th className="text-left p-2 border">Dosage</th>
          </tr>
        </thead>
        <tbody>
          {meds.map(m => (
            <tr key={m.id} className="border-t">
              <td className="p-2 border">{m.medicationName}</td>
              <td className="p-2 border">{m.dosage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
