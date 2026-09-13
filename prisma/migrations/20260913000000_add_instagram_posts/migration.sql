CREATE TABLE "InstagramPost" (
  "id" TEXT NOT NULL,
  "title" TEXT,
  "image" TEXT NOT NULL,
  "postUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InstagramPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InstagramPost_active_idx" ON "InstagramPost"("active");
CREATE INDEX "InstagramPost_active_sortOrder_idx" ON "InstagramPost"("active", "sortOrder");
