// CommonJS so there's zero ESM friction
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function inDays(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

(async function main() {
  try {
    const users = await prisma.patient.findMany({ select: { id: true } });
    for (const u of users) {
      await prisma.appointment.create({
        data: { patientId: u.id, date: inDays(7), reason: "Follow-up" },
      });
    }
    console.log(`ok – created ${users.length} appointment(s)`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
