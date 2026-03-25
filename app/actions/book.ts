"use server"

import { prisma } from "@/lib/prisma";
import { Book } from "@prisma/client";

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