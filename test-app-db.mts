import "dotenv/config";
import { prisma } from "./src/backend/database/prisma";

try {
  const users = await prisma.user.findMany();
  console.log("users:", users);
} catch (e: any) {
  console.log("ERROR:", e.message);
  console.log("CODE:", e.code);
  console.log("META:", e.meta);
  console.log("CAUSE:", e.cause?.message);
}
await prisma.$disconnect();
