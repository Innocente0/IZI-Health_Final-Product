require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@izihealth.rw")
    .trim()
    .toLowerCase();
  const password = (process.env.ADMIN_PASSWORD || "admin123").trim();
  const name = process.env.ADMIN_NAME || "IZI Health Admin";

  await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
    create: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });

  console.log(`Admin user ready: ${email}`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
