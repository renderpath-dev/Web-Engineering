import { createHash, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/contract_governed_notes_api";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl })
});

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function main(): Promise<void> {
  const email = "learner@example.test";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashValue("correct horse battery staple")
    }
  });

  const notebook = await prisma.notebook.upsert({
    where: { id: "11111111-1111-4111-8111-111111111111" },
    update: { title: "Contract examples" },
    create: {
      id: "11111111-1111-4111-8111-111111111111",
      userId: user.id,
      title: "Contract examples"
    }
  });

  await prisma.note.upsert({
    where: { id: "22222222-2222-4222-8222-222222222222" },
    update: { title: "OpenAPI boundary", body: "A public contract is not an ORM model." },
    create: {
      id: "22222222-2222-4222-8222-222222222222",
      notebookId: notebook.id,
      title: "OpenAPI boundary",
      body: "A public contract is not an ORM model."
    }
  });

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.session.create({
    data: {
      sessionTokenHash: hashValue(randomUUID()),
      csrfTokenHash: hashValue(randomUUID()),
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
