// app/admin/patients/new/page.tsx
import { createPatientAction } from "./actions";

export default function NewPatientPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">New Patient</h1>

      <form action={createPatientAction} className="space-y-3 border p-3 rounded max-w-xl">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input className="border p-2 rounded w-full" name="name" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="border p-2 rounded w-full" type="email" name="email" required />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone (optional)</label>
          <input className="border p-2 rounded w-full" name="phone" />
        </div>

        <button className="border px-3 py-1 rounded" type="submit">Create</button>
      </form>
    </main>
  );
}
