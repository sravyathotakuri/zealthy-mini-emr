
import Link from "next/link";

export default function Home() {

  return (

    <main className="p-6">

      <h1 className="text-2xl font-semibold">Zealthy Mini-EMR</h1>

      <p className="mt-2 text-gray-600">Choose a section:</p>

      <ul className="list-disc pl-6">
  <li><a href="/admin">Go to Admin</a></li>
  <li><a href="/portal">Go to Patient Portal</a></li> {/* <- no ?id=1 */}
</ul>


    </main>

);
}
