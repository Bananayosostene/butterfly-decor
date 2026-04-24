import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

async function main() {
  console.log("Setting up Butterfly Events Ltd admin...");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(" Missing env credentials");
  }

  // Check if admin already exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    return;
  }

  // Create admin user
  const admin = await prisma.adminUser.create({
    data: {
      email: adminEmail,
      password: hashPassword(adminPassword),
    },
  });

  console.log("Admin user created successfully!");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log("\nIMPORTANT: Change the password in production!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
