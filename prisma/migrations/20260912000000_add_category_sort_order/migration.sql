ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Category_active_sortOrder_idx" ON "Category"("active", "sortOrder");
