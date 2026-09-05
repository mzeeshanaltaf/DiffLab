-- CreateTable
CREATE TABLE "diffs" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "diffs_pkey" PRIMARY KEY ("id")
);
