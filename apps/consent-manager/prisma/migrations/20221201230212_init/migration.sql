-- CreateEnum
CREATE TYPE "State" AS ENUM ('CREATED', 'ACCEPT', 'DECLINE', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "CARequests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caId" UUID NOT NULL,
    "consent_artifact" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "state" "State" NOT NULL DEFAULT 'CREATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "webhook_url" TEXT NOT NULL,
    "total_attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CARequests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CARequests_caId_key" ON "CARequests"("caId");
