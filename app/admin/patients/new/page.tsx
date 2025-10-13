// app/admin/patients/actions.ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createPatientAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) {
    // You can throw or return; throwing will show a Next error overlay
    throw new Error("Name, email, and password are required");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const p = await prisma.patient.create({
    data: { name, email, phone: phone || null, passwordHash },
    select: { id: true },
  });

  redirect(`/admin/patients/${p.id}`);
}
