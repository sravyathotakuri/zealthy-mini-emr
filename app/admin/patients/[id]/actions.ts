"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Patient
export async function updatePatientAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!id || !name) throw new Error("id and name are required");
  await prisma.patient.update({ where: { id }, data: { name, phone: phone || null } });
  revalidatePath(`/admin/patients/${id}`);
}

// Appointments
export async function createAppointmentAction(formData: FormData) {
  const patientId = Number(formData.get("patientId"));
  const dateStr = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim() || null;
  const repeatSchedule = String(formData.get("repeatSchedule") ?? "").trim() || null;
  const repeatUntilStr = String(formData.get("repeatUntil") ?? "");
  const repeatUntil = repeatUntilStr ? new Date(repeatUntilStr) : null;

  if (!patientId || !dateStr) throw new Error("patientId and date are required");

  await prisma.appointment.create({
    data: {
      patientId,
      date: new Date(dateStr),
      reason: reason || null,
      provider,
      repeatSchedule,
      repeatUntil,
    },
  });
  redirect(`/admin/patients/${patientId}`);
}

export async function updateAppointmentAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const dateStr = String(formData.get("date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim() || null;
  const repeatSchedule = String(formData.get("repeatSchedule") ?? "").trim() || null;
  const repeatUntilStr = String(formData.get("repeatUntil") ?? "");
  const repeatUntil = repeatUntilStr ? new Date(repeatUntilStr) : null;

  if (!id || !dateStr) throw new Error("id and date are required");

  const appt = await prisma.appointment.update({
    where: { id },
    data: {
      date: new Date(dateStr),
      reason: reason || null,
      provider,
      repeatSchedule,
      repeatUntil,
    },
    select: { patientId: true },
  });
  revalidatePath(`/admin/patients/${appt.patientId}`);
}

export async function deleteAppointmentAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id required");
  const appt = await prisma.appointment.delete({ where: { id }, select: { patientId: true } });
  revalidatePath(`/admin/patients/${appt.patientId}`);
}

// Prescriptions
export async function createPrescriptionAction(formData: FormData) {
  const patientId = Number(formData.get("patientId"));
  const medication = String(formData.get("medication") ?? "").trim();
  const dosage = String(formData.get("dosage") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  const refillDateStr = String(formData.get("refillDate") ?? "");
  const refillDate = refillDateStr ? new Date(refillDateStr) : null;
  const refillSchedule = String(formData.get("refillSchedule") ?? "").trim() || null;

  if (!patientId || !medication || !dosage) throw new Error("patientId, medication, dosage required");

  await prisma.prescription.create({
    data: {
      patientId,
      medication,
      dosage,
      quantity,
      refillDate,
      refillSchedule,
    },
  });
  redirect(`/admin/patients/${patientId}`);
}

export async function updatePrescriptionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const medication = String(formData.get("medication") ?? "").trim();
  const dosage = String(formData.get("dosage") ?? "").trim();
  const quantityRaw = String(formData.get("quantity") ?? "").trim();
  const quantity = quantityRaw ? Number(quantityRaw) : null;
  const refillDateStr = String(formData.get("refillDate") ?? "");
  const refillDate = refillDateStr ? new Date(refillDateStr) : null;
  const refillSchedule = String(formData.get("refillSchedule") ?? "").trim() || null;

  if (!id) throw new Error("id required");

  const rx = await prisma.prescription.update({
    where: { id },
    data: { medication, dosage, quantity, refillDate, refillSchedule },
    select: { patientId: true },
  });
  revalidatePath(`/admin/patients/${rx.patientId}`);
}

export async function deletePrescriptionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) throw new Error("id required");
  const rx = await prisma.prescription.delete({ where: { id }, select: { patientId: true } });
  revalidatePath(`/admin/patients/${rx.patientId}`);
}
