/*
  Warnings:

  - You are about to drop the column `author` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `publishedYear` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "author",
DROP COLUMN "description",
DROP COLUMN "isbn",
DROP COLUMN "publishedYear";
