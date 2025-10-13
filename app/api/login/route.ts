// app/api/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";                 // use your alias
import bcrypt from "bcrypt";                       // or "bcryptjs" if you installed that
import { sessionOptions } from "@/lib/session";    //  use your alias
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Select only fields that exist in your Patient model
    const user = await prisma.patient.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true }, // <- remove `password`
    });

    const hash = user?.passwordHash;
    if (!user || !hash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!process.env.SESSION_SECRET) {
      console.error("SESSION_SECRET is missing in .env");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const session = await getIronSession<{ user?: { id: number; email: string } }>(
      await cookies(),
      sessionOptions
    );
    session.user = { id: user.id, email: user.email };
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/login error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
