"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createPatientAction(formData: FormData) {
  const name  = String(formData.get("name")  ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name || !email) throw new Error("name and email are required");

  const newPatient = await prisma.patient.create({
    data: {
      name,
      email,               // <-- include email to satisfy schema
      phone: phone || null
    },
  });

  redirect(`/admin/patients/${newPatient.id}`);
}
