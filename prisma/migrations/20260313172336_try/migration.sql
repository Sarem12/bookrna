/*
  Warnings:

  - You are about to drop the column `interests` on the `User` table. All the data in the column will be lost.
  - Added the required column `age` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Box" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "interests",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "tagId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
