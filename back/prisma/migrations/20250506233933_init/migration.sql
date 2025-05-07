/*
  Warnings:

  - You are about to drop the column `published` on the `article` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived');

-- AlterTable
ALTER TABLE "article" DROP COLUMN "published",
ADD COLUMN     "lastModifiedBy" TEXT,
ADD COLUMN     "status" "ArticleStatus" NOT NULL DEFAULT 'draft';
