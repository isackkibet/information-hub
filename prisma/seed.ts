import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { preferIpv4ForDatabaseHost } from "../src/backend/database/db-host";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

preferIpv4ForDatabaseHost(new URL(connectionString).hostname);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type SeedRole = "ADMINISTRATOR" | "EDITOR" | "VERIFIER" | "LEADERSHIP";
type SeedAccount = { name: string; email: string; password: string; role: SeedRole };
const accounts: SeedAccount[] = [];

function addAccount(name: string, email: string | undefined, password: string | undefined, role: SeedRole) {
  if (email && password) accounts.push({ name, email, password, role });
}

addAccount("SIHU Administrator", process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, "ADMINISTRATOR");
addAccount("SIHU Editor", process.env.EDITOR_EMAIL, process.env.EDITOR_PASSWORD, "EDITOR");
addAccount("SIHU Verifier", process.env.VERIFIER_EMAIL, process.env.VERIFIER_PASSWORD, "VERIFIER");
addAccount("SIHU Leadership", process.env.LEADERSHIP_EMAIL, process.env.LEADERSHIP_PASSWORD, "LEADERSHIP");

if (!accounts.some((account) => account.role === "ADMINISTRATOR")) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running the seed script.");
}

async function main() {
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role, status: "ACTIVE", passwordHash },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
        status: "ACTIVE",
      },
    });
    console.log(`Seeded ${account.role.padEnd(14)} ${user.email}`);
  }

  console.log("\nConfigured SIHU role accounts were seeded. Use the passwords from your environment configuration.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
