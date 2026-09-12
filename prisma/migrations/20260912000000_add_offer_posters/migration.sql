CREATE TABLE "OfferPoster" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "buttonLabel" TEXT,
    "buttonHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OfferPoster_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OfferPoster_active_idx" ON "OfferPoster"("active");
CREATE INDEX "OfferPoster_active_sortOrder_idx" ON "OfferPoster"("active", "sortOrder");
