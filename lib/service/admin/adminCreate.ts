import { prisma } from "@/lib/prisma"; // Adjust path to your prisma instance
import { Book,Lesson,RealParagraph,Unit } from "@prisma/client";

// We omit 'id' and 'createdAt' because the DB handles those
export async function createBook(data: Omit<Book, "id" | "createdAt">) {
  try {
    const newBook = await prisma.book.create({
      data: {
        subject: data.subject,
        grade: data.grade,
        imgUrl: data.imgUrl,
        // You can even initialize it with an empty unit if you want
        units: {
          create: [] 
        }
      },
    });

    console.log(`Success: ${newBook.subject} Grade ${newBook.grade} created.`);
    return newBook;
  } catch (error) {
    console.error("Failed to create book:", error);
    throw new Error("Could not create the book. check if the subject/grade combination is unique.");
  }
}

export async function createUnit(bookId: string, value: Partial<Unit>) {
  try {
    // 1. Verify the book exists first
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found.`);
    }

    // 2. Create the unit inside the book's context
    const newUnit = await prisma.unit.create({
      data: {
        title: value.title || "Untitled Unit",
        // Connect the relationship
        book: {
          connect: { id: bookId }
        },
        // Initialize lessons as empty
        lessons: {
          create: []
        }
      },
    });

    console.log(`✅ Unit "${newUnit.title}" added to ${book.subject}`);
    return newUnit;
  } catch (error) {
    console.error("Error creating unit:", error);
    throw error;
  }
}
export async function createLesson(unitId: string, value: Partial<Lesson>) {
  try {
    // 1. Get the current count of lessons in this unit to set the next index
    const lessonCount = await prisma.lesson.count({
      where: { unitId: unitId }
    });

    // 2. Create the lesson
    const newLesson = await prisma.lesson.create({
      data: {
        title: value.title || "New Lesson",
        index: value.index || (lessonCount + 1), // Auto-increment index if not provided
        unit: {
          connect: { id: unitId }
        },
        // Initialize with empty paragraphs (the actual textbook content)
        realParagraphs: {
          create: []
        }
      },
    });

    console.log(`✅ Lesson "${newLesson.title}" created at Index ${newLesson.index}`);
    return newLesson;
  } catch (error) {
    console.error("Error creating lesson:", error);
    throw new Error("Could not create lesson. Make sure the Unit ID is correct.");
  }
}
export async function createRealParagraph(lessonId: string, value: Partial<RealParagraph>) {
  try {
    // 1. Get the current count of paragraphs in this lesson to set the next order
    const paragraphCount = await prisma.realParagraph.count({
      where: { LessonId: lessonId }
    });

    // 2. Create the paragraph
    const newParagraph = await prisma.realParagraph.create({
      data: {
        content: value.content || "Empty paragraph content.",
        order: value.order || (paragraphCount + 1), // Auto-set order based on position
        lesson: {
          connect: { id: lessonId }
        }
      },
    });

    console.log(`✅ Paragraph added to Lesson ID ${lessonId} at Order ${newParagraph.order}`);
    return newParagraph;
  } catch (error) {
    console.error("Error creating real paragraph:", error);
    throw new Error("Failed to create paragraph. Ensure Lesson ID is valid.");
  }
}