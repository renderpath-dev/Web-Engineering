import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/resilient_notes_api"
});

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const email = "learner@example.com";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await hashPassword("Password123!")
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Reliability Lab"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Reliability Lab"
    }
  });

  await prisma.note.upsert({
    where: {
      notebookId_title: {
        notebookId: notebook.id,
        title: "Retry boundaries"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      notebookId: notebook.id,
      title: "Retry boundaries",
      body: "Retries must be bounded, classified, and safe."
    }
  });
}

await main();
await prisma.$disconnect();
