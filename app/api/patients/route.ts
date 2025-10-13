import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { id: "asc" },
      select: { id: true, email: true },
    });
    return Response.json({ patients });
  } catch (err) {
    console.error("GET /api/patients error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch patients" }), { status: 500 });
  }
}
