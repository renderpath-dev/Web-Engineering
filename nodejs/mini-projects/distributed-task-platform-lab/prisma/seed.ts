import { prisma, disconnectPrisma } from "../src/db/prisma.js";

async function seed(): Promise<void> {
  const project = await prisma.project.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {
      name: "Architecture Lab",
      description: "Seed project for task import and cache checks"
    },
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      name: "Architecture Lab",
      description: "Seed project for task import and cache checks"
    }
  });

  await prisma.task.upsert({
    where: {
      projectId_importBatchId_title: {
        projectId: project.id,
        importBatchId: "seed",
        title: "Map API and worker boundary"
      }
    },
    update: { completed: false },
    create: {
      projectId: project.id,
      title: "Map API and worker boundary",
      importBatchId: "seed"
    }
  });
}

seed()
  .then(async () => {
    await disconnectPrisma();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await disconnectPrisma();
    process.exit(1);
  });
