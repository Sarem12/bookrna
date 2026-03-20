/*
  Warnings:

  - You are about to drop the column `paragraphId` on the `Analogy` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `DefaultAnalogy` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `KeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `paragraphId` on the `KeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `KeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `KeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `dislikes` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `Paragraph` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `Paragraph` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Paragraph` table. All the data in the column will be lost.
  - You are about to drop the column `flags` on the `Summary` table. All the data in the column will be lost.
  - You are about to drop the column `usage` on the `Summary` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Summary` table. All the data in the column will be lost.
  - You are about to drop the column `flagged` on the `UserKeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `onUse` on the `UserKeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `skipped` on the `UserKeyWords` table. All the data in the column will be lost.
  - You are about to drop the column `flagged` on the `UserNote` table. All the data in the column will be lost.
  - You are about to drop the column `onUse` on the `UserNote` table. All the data in the column will be lost.
  - You are about to drop the column `skipped` on the `UserNote` table. All the data in the column will be lost.
  - You are about to drop the column `skipped` on the `UserSummary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tagId]` on the table `UniversalTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `realParagraphId` to the `DefaultAnalogy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realParagraphId` to the `DefaultParagraph` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realParagraphId` to the `KeyWordDefault` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Analogy" DROP COLUMN "paragraphId";

-- AlterTable
ALTER TABLE "Box" ADD COLUMN     "realParagraphId" TEXT;

-- AlterTable
ALTER TABLE "DefaultAnalogy" DROP COLUMN "createdAt",
ADD COLUMN     "realParagraphId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DefaultParagraph" ADD COLUMN     "realParagraphId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KeyWordDefault" ADD COLUMN     "realParagraphId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KeyWords" DROP COLUMN "flags",
DROP COLUMN "paragraphId",
DROP COLUMN "usage",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "dislikes",
DROP COLUMN "flags",
DROP COLUMN "likes",
DROP COLUMN "usage",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "Paragraph" DROP COLUMN "flags",
DROP COLUMN "usage",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "Summary" DROP COLUMN "flags",
DROP COLUMN "usage",
DROP COLUMN "views";

-- AlterTable
ALTER TABLE "UserKeyWords" DROP COLUMN "flagged",
DROP COLUMN "onUse",
DROP COLUMN "skipped";

-- AlterTable
ALTER TABLE "UserNote" DROP COLUMN "flagged",
DROP COLUMN "onUse",
DROP COLUMN "skipped";

-- AlterTable
ALTER TABLE "UserSummary" DROP COLUMN "skipped";

-- CreateTable
CREATE TABLE "RealParagraph" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealParagraph_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UniversalTag_tagId_key" ON "UniversalTag"("tagId");

-- AddForeignKey
ALTER TABLE "RealParagraph" ADD CONSTRAINT "RealParagraph_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultAnalogy" ADD CONSTRAINT "DefaultAnalogy_realParagraphId_fkey" FOREIGN KEY ("realParagraphId") REFERENCES "RealParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultParagraph" ADD CONSTRAINT "DefaultParagraph_realParagraphId_fkey" FOREIGN KEY ("realParagraphId") REFERENCES "RealParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyWordDefault" ADD CONSTRAINT "KeyWordDefault_realParagraphId_fkey" FOREIGN KEY ("realParagraphId") REFERENCES "RealParagraph"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Box" ADD CONSTRAINT "Box_realParagraphId_fkey" FOREIGN KEY ("realParagraphId") REFERENCES "RealParagraph"("id") ON DELETE SET NULL ON UPDATE CASCADE;
