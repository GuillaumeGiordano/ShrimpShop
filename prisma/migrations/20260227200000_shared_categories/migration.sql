-- AlterTable articles: replace category enum with categoryId FK
ALTER TABLE "articles" ADD COLUMN "category_id" TEXT;

-- AlterTable faqs: replace category enum with categoryId FK
ALTER TABLE "faqs" ADD COLUMN "category_id" TEXT;

-- AlterTable photos: add categoryId FK
ALTER TABLE "photos" ADD COLUMN "category_id" TEXT;

-- Drop old enum columns
ALTER TABLE "articles" DROP COLUMN "category";
ALTER TABLE "faqs" DROP COLUMN "category";

-- Drop old enums
DROP TYPE IF EXISTS "ArticleCategory";
DROP TYPE IF EXISTS "FaqCategory";

-- AddForeignKey for articles.category_id
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "product_categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for faqs.category_id
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "product_categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for photos.category_id
ALTER TABLE "photos" ADD CONSTRAINT "photos_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "product_categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");
CREATE INDEX "faqs_category_id_idx" ON "faqs"("category_id");
CREATE INDEX "photos_category_id_idx" ON "photos"("category_id");
