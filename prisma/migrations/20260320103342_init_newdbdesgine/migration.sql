/*
  Warnings:

  - You are about to drop the column `logo` on the `Box` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Box` table. All the data in the column will be lost.
  - You are about to drop the column `paragraphId` on the `Box` table. All the data in the column will be lost.
  - You are about to drop the column `placement` on the `Box` table. All the data in the column will be lost.
  - You are about to drop the column `depth` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `labels` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exercise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterAnalogy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterKeyword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterParagraph` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagRelator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UnitSummary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSelection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `class` to the `Box` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Box` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `index` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Made the column `unitId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `bookId` to the `Unit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('LIKED', 'DISLIKED', 'NEUTRAL');

-- DropForeignKey
ALTER TABLE "Box" DROP CONSTRAINT "Box_paragraphId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_paragraphId_fkey";

-- DropForeignKey
ALTER TABLE "Example" DROP CONSTRAINT "Example_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_unitId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_unitId_fkey";

-- DropForeignKey
ALTER TABLE "MasterAnalogy" DROP CONSTRAINT "MasterAnalogy_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "MasterAnalogy" DROP CONSTRAINT "MasterAnalogy_paragraphId_fkey";

-- DropForeignKey
ALTER TABLE "MasterAnalogy" DROP CONSTRAINT "MasterAnalogy_unitId_fkey";

-- DropForeignKey
ALTER TABLE "MasterKeyword" DROP CONSTRAINT "MasterKeyword_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "MasterKeyword" DROP CONSTRAINT "MasterKeyword_unitId_fkey";

-- DropForeignKey
ALTER TABLE "MasterParagraph" DROP CONSTRAINT "MasterParagraph_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_analogyId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_keywordId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_paragraphId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagRelator" DROP CONSTRAINT "TagRelator_unitId_fkey";

-- DropForeignKey
ALTER TABLE "UnitSummary" DROP CONSTRAINT "UnitSummary_unitId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tagId_fkey";

-- DropForeignKey
ALTER TABLE "UserSelection" DROP CONSTRAINT "UserSelection_activeAnalogyId_fkey";

-- DropForeignKey
ALTER TABLE "UserSelection" DROP CONSTRAINT "UserSelection_masterParagraphId_fkey";

-- DropForeignKey
ALTER TABLE "UserSelection" DROP CONSTRAINT "UserSelection_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- AlterTable
ALTER TABLE "Box" DROP COLUMN "logo",
DROP COLUMN "order",
DROP COLUMN "paragraphId",
DROP COLUMN "placement",
ADD COLUMN     "class" TEXT NOT NULL,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "depth",
DROP COLUMN "order",
DROP COLUMN "parentId",
ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "parentLessonId" TEXT,
ALTER COLUMN "unitId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "labels",
ADD COLUMN     "linkedWith" TEXT[];

-- AlterTable
ALTER TABLE "Unit" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tagId",
ADD COLUMN     "first" TEXT NOT NULL,
ADD COLUMN     "imgUrl" TEXT,
ADD COLUMN     "last" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "uiSettings" JSONB NOT NULL DEFAULT '{"theme": "system", "sidebarCollapsed": false}',
ADD COLUMN     "userspecificAPI" TEXT[];

-- DropTable
DROP TABLE "Example";

-- DropTable
DROP TABLE "Exercise";

-- DropTable
DROP TABLE "MasterAnalogy";

-- DropTable
DROP TABLE "MasterKeyword";

-- DropTable
DROP TABLE "MasterParagraph";

-- DropTable
DROP TABLE "TagRelator";

-- DropTable
DROP TABLE "UnitSummary";

-- DropTable
DROP TABLE "UserSelection";

-- DropTable
DROP TABLE "UserSettings";

-- DropEnum
DROP TYPE "Placement";

-- CreateTable
CREATE TABLE "UserTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "likingLevel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "imgUrl" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversalTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "UniversalTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analogy" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "logic" TEXT NOT NULL,
    "lessonId" TEXT,
    "paragraphId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultAnalogyId" TEXT NOT NULL,

    CONSTRAINT "Analogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultAnalogy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentAnalogyId" TEXT,

    CONSTRAINT "DefaultAnalogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnalogy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analogyId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEUTRAL',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "onUse" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnalogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paragraph" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultParagraphId" TEXT NOT NULL,

    CONSTRAINT "Paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultParagraph" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "currentParagraphId" TEXT,

    CONSTRAINT "DefaultParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserParagraph" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEUTRAL',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "onUse" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lessonId" TEXT,
    "unitId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultSummaryId" TEXT NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "unitId" TEXT NOT NULL,
    "currentSummaryId" TEXT,

    CONSTRAINT "DefaultSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEUTRAL',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "onUse" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyWords" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "paragraphId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultKeyWordId" TEXT NOT NULL,

    CONSTRAINT "KeyWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyWord" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "keywordsId" TEXT NOT NULL,

    CONSTRAINT "KeyWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyWordDefault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "currentKeyWordsId" TEXT,

    CONSTRAINT "KeyWordDefault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKeyWords" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keywordsId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEUTRAL',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "onUse" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKeyWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "usage" INTEGER NOT NULL DEFAULT 0,
    "flags" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defaultNoteId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteDefault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "currentNoteId" TEXT,

    CONSTRAINT "NoteDefault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'NEUTRAL',
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "onUse" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelatorAnalogy" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "analogyId" TEXT NOT NULL,

    CONSTRAINT "TagRelatorAnalogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelatorParagraph" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "paragraphId" TEXT NOT NULL,

    CONSTRAINT "TagRelatorParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelatorSummary" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "summaryId" TEXT NOT NULL,

    CONSTRAINT "TagRelatorSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelatorKeyWords" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "keywordsId" TEXT NOT NULL,

    CONSTRAINT "TagRelatorKeyWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelatorNote" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "TagRelatorNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultAnalogy_currentAnalogyId_key" ON "DefaultAnalogy"("currentAnalogyId");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultParagraph_currentParagraphId_key" ON "DefaultParagraph"("currentParagraphId");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultSummary_currentSummaryId_key" ON "DefaultSummary"("currentSummaryId");

-- CreateIndex
CREATE UNIQUE INDEX "KeyWordDefault_currentKeyWordsId_key" ON "KeyWordDefault"("currentKeyWordsId");

-- CreateIndex
CREATE UNIQUE INDEX "NoteDefault_currentNoteId_key" ON "NoteDefault"("currentNoteId");

-- AddForeignKey
ALTER TABLE "UserTag" ADD CONSTRAINT "UserTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTag" ADD CONSTRAINT "UserTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_parentLessonId_fkey" FOREIGN KEY ("parentLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversalTag" ADD CONSTRAINT "UniversalTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analogy" ADD CONSTRAINT "Analogy_defaultAnalogyId_fkey" FOREIGN KEY ("defaultAnalogyId") REFERENCES "DefaultAnalogy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analogy" ADD CONSTRAINT "Analogy_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultAnalogy" ADD CONSTRAINT "DefaultAnalogy_currentAnalogyId_fkey" FOREIGN KEY ("currentAnalogyId") REFERENCES "Analogy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultAnalogy" ADD CONSTRAINT "DefaultAnalogy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnalogy" ADD CONSTRAINT "UserAnalogy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnalogy" ADD CONSTRAINT "UserAnalogy_analogyId_fkey" FOREIGN KEY ("analogyId") REFERENCES "Analogy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_defaultParagraphId_fkey" FOREIGN KEY ("defaultParagraphId") REFERENCES "DefaultParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultParagraph" ADD CONSTRAINT "DefaultParagraph_currentParagraphId_fkey" FOREIGN KEY ("currentParagraphId") REFERENCES "Paragraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultParagraph" ADD CONSTRAINT "DefaultParagraph_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserParagraph" ADD CONSTRAINT "UserParagraph_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserParagraph" ADD CONSTRAINT "UserParagraph_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "Paragraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_defaultSummaryId_fkey" FOREIGN KEY ("defaultSummaryId") REFERENCES "DefaultSummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultSummary" ADD CONSTRAINT "DefaultSummary_currentSummaryId_fkey" FOREIGN KEY ("currentSummaryId") REFERENCES "Summary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultSummary" ADD CONSTRAINT "DefaultSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultSummary" ADD CONSTRAINT "DefaultSummary_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSummary" ADD CONSTRAINT "UserSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSummary" ADD CONSTRAINT "UserSummary_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWords" ADD CONSTRAINT "KeyWords_defaultKeyWordId_fkey" FOREIGN KEY ("defaultKeyWordId") REFERENCES "KeyWordDefault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWords" ADD CONSTRAINT "KeyWords_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWord" ADD CONSTRAINT "KeyWord_keywordsId_fkey" FOREIGN KEY ("keywordsId") REFERENCES "KeyWords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWordDefault" ADD CONSTRAINT "KeyWordDefault_currentKeyWordsId_fkey" FOREIGN KEY ("currentKeyWordsId") REFERENCES "KeyWords"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWordDefault" ADD CONSTRAINT "KeyWordDefault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKeyWords" ADD CONSTRAINT "UserKeyWords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKeyWords" ADD CONSTRAINT "UserKeyWords_keywordsId_fkey" FOREIGN KEY ("keywordsId") REFERENCES "KeyWords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_defaultNoteId_fkey" FOREIGN KEY ("defaultNoteId") REFERENCES "NoteDefault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDefault" ADD CONSTRAINT "NoteDefault_currentNoteId_fkey" FOREIGN KEY ("currentNoteId") REFERENCES "Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDefault" ADD CONSTRAINT "NoteDefault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorAnalogy" ADD CONSTRAINT "TagRelatorAnalogy_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorAnalogy" ADD CONSTRAINT "TagRelatorAnalogy_analogyId_fkey" FOREIGN KEY ("analogyId") REFERENCES "Analogy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorParagraph" ADD CONSTRAINT "TagRelatorParagraph_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorParagraph" ADD CONSTRAINT "TagRelatorParagraph_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "Paragraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorSummary" ADD CONSTRAINT "TagRelatorSummary_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorSummary" ADD CONSTRAINT "TagRelatorSummary_summaryId_fkey" FOREIGN KEY ("summaryId") REFERENCES "Summary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorKeyWords" ADD CONSTRAINT "TagRelatorKeyWords_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorKeyWords" ADD CONSTRAINT "TagRelatorKeyWords_keywordsId_fkey" FOREIGN KEY ("keywordsId") REFERENCES "KeyWords"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorNote" ADD CONSTRAINT "TagRelatorNote_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelatorNote" ADD CONSTRAINT "TagRelatorNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
