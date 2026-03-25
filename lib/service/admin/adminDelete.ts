import { PrismaClient } from "@prisma/client/extension";
const prisma = new PrismaClient();
export async function deleteBook(bookId: string) {
  try {
    await prisma.book.delete({
      where: { id: bookId }
    });
    console.log(`Success: Book with ID ${bookId} deleted.`);
  } catch (error) {
    console.error("Failed to delete book:", error);
    throw new Error("Could not delete the book.");
  }
}
export async function deleteUnit(unitId: string) {
  try {
    await prisma.unit.delete({
      where: { id: unitId }
    });
    console.log(`Success: Unit with ID ${unitId} deleted.`);
  } catch (error) {
    console.error("Failed to delete unit:", error);
    throw new Error("Could not delete the unit.");
  }
}
export async function deleteLesson(lessonId: string) {
  try {
    await prisma.lesson.delete({
      where: { id: lessonId }
    });
    console.log(`Success: Lesson with ID ${lessonId} deleted.`);
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    throw new Error("Could not delete the lesson.");
  }
}
export async function deleteParagraph(paragraphId: string) {
  try {
    await prisma.realParagraph.delete({
      where: { id: paragraphId }
    });
    console.log(`Success: Paragraph with ID ${paragraphId} deleted.`);
  } catch (error) {
    console.error("Failed to delete paragraph:", error);
    throw new Error("Could not delete the paragraph.");
  }
}