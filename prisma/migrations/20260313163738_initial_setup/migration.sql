-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('BEFORE', 'AFTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "interests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{"theme": "light", "colors": {}}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,
    "parentId" TEXT,
    "unitId" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterParagraph" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "MasterParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "logo" TEXT,
    "content" JSONB NOT NULL,
    "paragraphId" TEXT NOT NULL,
    "placement" "Placement" NOT NULL DEFAULT 'AFTER',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterKeyword" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "unitId" TEXT,
    "lessonId" TEXT,

    CONSTRAINT "MasterKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "answer" TEXT NOT NULL,
    "unitId" TEXT,
    "lessonId" TEXT,
    "paragraphId" TEXT,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "unitId" TEXT,
    "lessonId" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitSummary" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "UnitSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "labels" TEXT[],

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagRelator" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "unitId" TEXT,
    "lessonId" TEXT,
    "paragraphId" TEXT,
    "analogyId" TEXT,
    "keywordId" TEXT,

    CONSTRAINT "TagRelator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterAnalogy" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "unitId" TEXT,
    "lessonId" TEXT,
    "paragraphId" TEXT,

    CONSTRAINT "MasterAnalogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSelection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterParagraphId" TEXT NOT NULL,
    "activeAnalogyId" TEXT,

    CONSTRAINT "UserSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitSummary_unitId_key" ON "UnitSummary"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSelection_userId_masterParagraphId_key" ON "UserSelection"("userId", "masterParagraphId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterParagraph" ADD CONSTRAINT "MasterParagraph_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "MasterParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterKeyword" ADD CONSTRAINT "MasterKeyword_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterKeyword" ADD CONSTRAINT "MasterKeyword_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "MasterParagraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitSummary" ADD CONSTRAINT "UnitSummary_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "MasterParagraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_analogyId_fkey" FOREIGN KEY ("analogyId") REFERENCES "MasterAnalogy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagRelator" ADD CONSTRAINT "TagRelator_keywordId_fkey" FOREIGN KEY ("keywordId") REFERENCES "MasterKeyword"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterAnalogy" ADD CONSTRAINT "MasterAnalogy_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterAnalogy" ADD CONSTRAINT "MasterAnalogy_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterAnalogy" ADD CONSTRAINT "MasterAnalogy_paragraphId_fkey" FOREIGN KEY ("paragraphId") REFERENCES "MasterParagraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelection" ADD CONSTRAINT "UserSelection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelection" ADD CONSTRAINT "UserSelection_masterParagraphId_fkey" FOREIGN KEY ("masterParagraphId") REFERENCES "MasterParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelection" ADD CONSTRAINT "UserSelection_activeAnalogyId_fkey" FOREIGN KEY ("activeAnalogyId") REFERENCES "MasterAnalogy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
