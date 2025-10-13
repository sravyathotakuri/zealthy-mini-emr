
import Link from "next/link";

export default function Home() {

return(
    <main className="p-6">

      <h1 className="text-2xl font-semibold">Zealthy Mini-EMR</h1>

      <p className="mt-2 text-gray-600">Choose a section:</p>

      <ul className="mt-4 list-disc pl-6 space-y-2">

        <li><Link href="/admin">Go to Admin</Link></li>

        <li><Link href="/portal">Go to Patient Portal</Link></li>

</ul>
</main>
);
}
