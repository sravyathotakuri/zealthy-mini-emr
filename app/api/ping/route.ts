import { NextResponse } from "next/server";

import { cookies } from "next/headers";

export async function GET() {

  const session = (await cookies()).get("zealthy_session")?.value ?? null;

  return NextResponse.json({ ok: true, session });
}
