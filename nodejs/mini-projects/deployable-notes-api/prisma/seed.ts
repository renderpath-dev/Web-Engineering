import { prisma } from "../src/db/prisma.js";
import { hashPassword } from "../src/shared/auth/password-hashing.js";

async function seed(): Promise<void> {
  const passwordHash = await hashPassword("ChangeMe123!45");

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      role: "USER"
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Release Notes"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      name: "Release Notes"
    }
  });

  await prisma.note.upsert({
    where: {
      notebookId_title: {
        notebookId: notebook.id,
        title: "Deployment checklist"
      }
    },
    update: {},
    create: {
      ownerId: user.id,
      notebookId: notebook.id,
      title: "Deployment checklist",
      body: "Run install, generate, typecheck, test, build, migrate deploy, and smoke."
    }
  });
}

await seed();
await prisma.$disconnect();
