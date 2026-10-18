CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "importBatchId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobRecord" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobId" TEXT NOT NULL,
  "jobName" TEXT NOT NULL,
  "payloadVersion" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "correlationId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "failureClass" TEXT,
  "failureCode" TEXT,
  "payload" JSONB NOT NULL,
  "result" JSONB,
  "projectId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobRecordId" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JobEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Task_projectId_importBatchId_title_key" ON "Task"("projectId", "importBatchId", "title");
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");
CREATE UNIQUE INDEX "JobRecord_jobId_key" ON "JobRecord"("jobId");
CREATE UNIQUE INDEX "JobRecord_idempotencyKey_key" ON "JobRecord"("idempotencyKey");
CREATE INDEX "JobRecord_status_idx" ON "JobRecord"("status");
CREATE INDEX "JobRecord_projectId_idx" ON "JobRecord"("projectId");
CREATE INDEX "JobEvent_jobRecordId_createdAt_idx" ON "JobEvent"("jobRecordId", "createdAt");

ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobRecord" ADD CONSTRAINT "JobRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobEvent" ADD CONSTRAINT "JobEvent_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "JobRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
